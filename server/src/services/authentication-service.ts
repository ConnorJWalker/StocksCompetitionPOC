import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import ISignupForm from '../models/dto/isignup-form'
import DatabaseService from './database-service'
import IUser, {IUserWithSecrets} from '../models/iuser'
import ILoginForm from '../models/dto/ilogin-form'

const SignUp = async (signupForm: ISignupForm): Promise<string> => {
    const hashedPassword = await bcrypt.hash(signupForm.password, 10)
    const user = await DatabaseService.CreateUser(signupForm, hashedPassword)

    return createToken(user)
}

const LogIn = async (loginForm: ILoginForm): Promise<string | null> => {
    const user = await DatabaseService.FindUserByUsernameWithSecrets(loginForm.discordUsername)
    if (user === null) return null

    if (await bcrypt.compare(loginForm.password, user.password)) {
        return createToken({ ...user, password: undefined, apiKey: undefined })
    }

    return null
}

function createToken(user: IUser | IUserWithSecrets) {
    return jwt.sign({ ...user }, process.env.JWT_SECRET as jwt.Secret)
}

export default {
    SignUp,
    LogIn
}
