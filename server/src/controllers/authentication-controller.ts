import { Request, Response } from "express";

const SignUp = (req: Request, res: Response) => {
    return res.send('Sign Up')
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