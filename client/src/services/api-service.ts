import ILoginForm from '../models/dto/ilogin-form'
import ISignupForm from '../models/dto/isignup-form'
import IHttpResult, { IHttpErrorResult } from '../models/ihttp-result'

interface AuthResponse { token: string }

export class HttpError extends Error {
    public statusCode: number
    public response: IHttpErrorResult

    constructor(httpResult: IHttpResult<IHttpErrorResult>) {
        super()

        this.statusCode = httpResult.statusCode
        this.response = httpResult.content
    }
}

const Login = async (loginForm: ILoginForm): Promise<string> => {
    const response = await sendWithoutAuth<AuthResponse>(
        'authentication/login',
        'post',
        loginForm
    )

    if (response.ok) {
        return (response.content as AuthResponse).token
    }

    throw new HttpError(response as IHttpResult<IHttpErrorResult>)
}

const SignUp = async (signupForm: ISignupForm): Promise<string> => {
    const response = await sendWithoutAuth<AuthResponse>(
        'authentication/signup',
        'post',
        signupForm
    )

    if (response.ok) {
        return (response.content as AuthResponse).token
    }

    throw new HttpError(response as IHttpResult<IHttpErrorResult>)
}

const sendWithoutAuth = async <T>(endpoint: string, method: string = 'get', body: object | null = null): Promise<IHttpResult<T | IHttpErrorResult>> => {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}${endpoint}`, {
        method,
        body: JSON.stringify(body),
        headers: new Headers({
            'content-type': 'application/json'
        })
    })

    return {
        ok: response.ok,
        statusCode: response.status,
        content: await response.json()
    }
}

export default {
    Login,
    SignUp
}
