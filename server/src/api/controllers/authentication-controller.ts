import { Request, Response } from 'express'
import AuthenticationService from '../services/authentication-service'
import SignUpValidator from '../utils/sign-up-validator'
import ISignupForm from '../models/dto/isignup-form'
import { RateLimitError } from '../models/errors'
import DiscordService from '../../shared/services/discord-service'

const SignUp = async (req: Request, res: Response) => {
    const signupValidator = new SignUpValidator()

    let signupForm: ISignupForm | null
    try {
        signupForm = await signupValidator.formFromRequestBody(req.body)

        if (signupForm === null) {
            return res.status(400).json({ errors: signupValidator.validationErrors })
        }

        signupForm.profilePicture = await DiscordService.GetProfilePicture(signupForm.discordUsername!)
    }
    catch (error) {
        if (error instanceof RateLimitError) {
            return res.status(429).json({ error: error.message })
        }

        throw error
    }

    const authenticationResponse = await AuthenticationService.SignUp(signupForm)
    try {
        await DiscordService.SendWelcomeMessage(signupForm.discordUsername, true)
    }
    catch { /* Ignore */ }

    return res.status(201).json(authenticationResponse)
}

const LogIn = async (req: Request, res: Response) => {
    if (!req.body || !req.body.discordUsername || !req.body.password) {
        return res.status(400).json({ error: 'discord username and password are required' })
    }

    const authenticationResponse = await AuthenticationService.LogIn(req.body)
    if (authenticationResponse === null) {
        return res.status(401).json({ error: 'discord username or password is incorrect' })
    }

    return res.json(authenticationResponse)
}

const Refresh = async (req: Request, res: Response) => {
    const token = req.headers['authorization'] as string | undefined
    if (token === undefined) {
        return res.status(400).json({ error: 'refresh token is required' })
    }

    const tokenSplit = token.split(' ')
    if (tokenSplit[0] !== 'Bearer') {
        return res.status(400).json({ error: 'invalid token' })
    }

    const newToken = await AuthenticationService.Refresh(tokenSplit[1])

    return newToken === null
        ? res.status(403).send()
        : res.json(newToken)
}

const ValidateDiscordUsername = async (req: Request, res: Response) => {
    const signupValidator = new SignUpValidator()
    await signupValidator.validateDiscordUsername(req.params.discordUsername)

    if (signupValidator.validationErrors['discordUsername'] === undefined) {
        return res.status(200).json({ /* Empty */ })
    }

    return res.status(400).json({ errors: signupValidator.validationErrors })
}

const GetProfilePicture = async (req: Request, res: Response) => {
    const signupValidator = new SignUpValidator()
    await signupValidator.validateDiscordUsername(req.params.discordUsername)

    if (signupValidator.validationErrors['discordUsername'] !== undefined) {
        return res.status(400).json({ errors: signupValidator.validationErrors })
    }

    const profilePicture = await DiscordService.GetProfilePicture(req.params.discordUsername)
    return res.json({ profilePicture })
}

export default {
    SignUp,
    LogIn,
    Refresh,
    ValidateDiscordUsername,
    GetProfilePicture
}