import { Request, Response } from 'express'
import AuthenticationService from '../services/authentication-service'
import SignUpValidator from '../utils/sign-up-validator'
import ISignupForm from '../models/dto/isignup-form'
import {RateLimitError} from '../models/errors'
import DiscordService from '../services/discord-service'

const SignUp = async (req: Request, res: Response) => {
    const signupValidator = new SignUpValidator()

    let signupForm: ISignupForm | null
    try {
        signupForm = await signupValidator.formFromRequestBody(req.body)
    }
    catch (error) {
        if (error instanceof RateLimitError) {
            return res.status(429).json({ error: error.message })
        }

        throw error
    }

    if (signupForm === null) {
        res.statusCode = 400
        return res.send({ errors: signupValidator.validationErrors })
    }

    const token = await AuthenticationService.SignUp(signupForm)
    try {
        await DiscordService.SendWelcomeMessage(signupForm.discordUsername, true)
    }
    catch { /* Ignore */ }

    return res.status(201).json({ token })
}

const LogIn = async (req: Request, res: Response) => {
    if (!req.body || !req.body.discordUsername || !req.body.password) {
        return res.status(400).json({ error: 'discord username and password are required' })
    }

    const token = await AuthenticationService.LogIn(req.body)
    if (token === null) {
        return res.status(401).json({ error: 'discord username or password is incorrect' })
    }

    return res.send({ token })
}

const Refresh = (req: Request, res: Response) => {
    return res.send('Refresh')
}

export default {
    SignUp,
    LogIn,
    Refresh
}