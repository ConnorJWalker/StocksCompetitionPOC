import { Request, Response } from 'express'
import AuthenticationService from '../services/authentication-service'
import SignUpValidator from '../utils/sign-up-validator'

const SignUp = async (req: Request, res: Response) => {
    const signupValidator = new SignUpValidator()
    const signupForm = signupValidator.formFromRequestBody(req.body)
    if (signupForm === null) {
        res.statusCode = 400
        return res.send({ errors: signupValidator.validationErrors })
    }

    const token = await AuthenticationService.CreateUser(signupForm)

    res.statusCode = 201
    return res.send({ token })
}

const LogIn = (req: Request, res: Response) => {
    return res.send('Log In')
}

const Refresh = (req: Request, res: Response) => {
    return res.send('Refresh')
}

export default {
    SignUp,
    LogIn,
    Refresh
}