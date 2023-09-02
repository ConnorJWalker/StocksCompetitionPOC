import { Request, Response } from 'express'
import AuthenticationService from '../services/authentication-service'
import SignUpValidator from '../utils/sign-up-validator'

const SignUp = async (req: Request, res: Response) => {
    const signupValidator = new SignUpValidator()
    const signupForm = await signupValidator.formFromRequestBody(req.body)
    if (signupForm === null) {
        res.statusCode = 400
        return res.send({ errors: signupValidator.validationErrors })
    }

    const token = await AuthenticationService.SignUp(signupForm)

    res.statusCode = 201
    return res.send({ token })
}

const LogIn = async (req: Request, res: Response) => {
    if (!req.body || !req.body.discordUsername || !req.body.password) {
        res.statusCode = 400
        return res.send({ error: 'discord username and password are required' })
    }

    const token = await AuthenticationService.LogIn(req.body)
    if (token === null) {
        res.statusCode = 401
        return res.send({ error: 'discord username or password is incorrect' })
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