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

const ValidateDiscordUsername = async (req: Request, res: Response) => {
    const signupValidator = new SignUpValidator()
    await signupValidator.validateDiscordUsername(req.params.discordUsername)

    if (signupValidator.validationErrors['discordUsername'] === undefined) {
        return res.status(200).json({ })
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
    return res.status(200).json({ profilePicture })
}

export default {
    SignUp,
    LogIn,
    Refresh,
    ValidateDiscordUsername,
    GetProfilePicture
}