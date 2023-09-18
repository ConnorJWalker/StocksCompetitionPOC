import * as crypto from 'node:crypto'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import ISignupForm from '../models/dto/isignup-form'
import DatabaseService from './database-service'
import IUser from '../models/iuser'
import ILoginForm from '../models/dto/ilogin-form'
import IAuthenticationResponse from '../models/dto/responses/iauthentication-response'

/**
 * Creates a new user in the database and creates authentication tokens containing the user's sign up
 * information
 *
 * @param {ISignupForm} signupForm Validated user sing up form
 * @returns {Promise<IAuthenticationResponse>} Object containing access and refresh tokens
 */
const SignUp = async (signupForm: ISignupForm): Promise<IAuthenticationResponse> => {
    const hashedPassword = await bcrypt.hash(signupForm.password, 10)
    const user = await DatabaseService.CreateUser(signupForm, hashedPassword)

    const authenticationTokens = createToken(user)
    await DatabaseService.CreateRefreshToken(crypto.randomUUID(), authenticationTokens.refreshToken)

    return authenticationTokens
}

/**
 * Validates user's log in request and creates authentication tokens containing the user's information
 * stored in the database
 *
 * @param {ILoginForm} loginForm Object containing user's discord username and api password
 * @returns {Promise<IAuthenticationResponse | null>} Object containing access and refresh tokens on
 * success or null on invalid login
 */
const LogIn = async (loginForm: ILoginForm): Promise<IAuthenticationResponse | null> => {
    const user = await DatabaseService.FindUserByUsernameWithSecrets(loginForm.discordUsername)
    if (user === null) return null

    if (!await bcrypt.compare(loginForm.password, user.password)) {
        return null
    }

    const authenticationTokens = createToken(user)
    await DatabaseService.CreateRefreshToken(crypto.randomUUID(), authenticationTokens.refreshToken)

    return authenticationTokens
}

/**
 * Validates user's refresh token and creates new authentication tokens containing the user's information
 * stored inside the refresh token. Invalidates all tokens within the token family on attempt to reuse token
 *
 * @param {string} token User's refresh token
 * @returns {Promise<IAuthenticationResponse | null>} Object containing access and refresh tokens on
 * success or null on invalid refresh token
 */
const Refresh = async (token: string): Promise<IAuthenticationResponse | null> => {
    const storedToken = await DatabaseService.GetRefreshToken(token)
    if (storedToken === null || storedToken.invalid) {
        return null
    }

    let user: IUser | undefined
    try {
        user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as jwt.Secret) as IUser
    }
    catch {
        await DatabaseService.InvalidateRefreshTokenFamily(storedToken.family)
        return null
    }

    if (storedToken.used) {
        await DatabaseService.InvalidateRefreshTokenFamily(storedToken.family)
        return null
    }

    await DatabaseService.MarkRefreshTokenAsUsed(storedToken.id)

    const authenticationTokens = createToken(user!)

    await DatabaseService.CreateRefreshToken(storedToken.family, authenticationTokens.refreshToken)

    return authenticationTokens
}

/**
 * Sanitises and signs user object into an access and refresh token
 *
 * @param {IUser} user Object containing user information to encode
 * @returns {IAuthenticationResponse} Object containing the new access and refresh tokens
 */
function createToken(user: IUser): IAuthenticationResponse {
    // remove potential additional fields such as previous jwt claims or user secrets
    const payload: IUser = {
        id: user.id,
        displayName: user.displayName,
        discordUsername: user.discordUsername,
        profilePicture: user.profilePicture,
        displayColour: user.displayColour
    }

    return {
        accessToken: jwt.sign(
            payload,
            process.env.JWT_SECRET as jwt.Secret,
            { expiresIn: '15m' }
        ),
        refreshToken: jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
            { expiresIn: '1w' }
        )
    }
}

export default {
    SignUp,
    LogIn,
    Refresh
}
