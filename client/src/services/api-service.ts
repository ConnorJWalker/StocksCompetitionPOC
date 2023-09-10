import ILoginForm from '../models/dto/ilogin-form'
import ISignupForm from '../models/dto/isignup-form'
import IHttpResult, { IHttpErrorResult } from '../models/ihttp-result'
import IProfilePicture from '../models/dto/iprofile-picture'

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

const GetDiscordUsernameErrors = async (discordUsername: string): Promise<string[]> => {
    const response = await sendWithoutAuth(`authentication/validate-username/${discordUsername}`)

    if (response.ok) {
        return []
    }

    if (response.statusCode === 400) {
        return (response.content as IHttpErrorResult).errors!['discordUsername'] || ['an error occurred validating discord username']
    }

    return ['an error occurred validating discord username']
}

const GetDiscordProfilePicture = async (discordUsername: string): Promise<string | undefined> => {
    const response = await sendWithoutAuth<IProfilePicture>(`authentication/profile-picture/${discordUsername}`)

    if (!response.ok) return

    return (response.content as IProfilePicture).profilePicture
}

const sendWithoutAuth = async <T>(endpoint: string, method: string = 'get', body: object | null = null): Promise<IHttpResult<T | IHttpErrorResult>> => {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}${endpoint}`, {
        method,
        body: method === 'get' ? undefined : JSON.stringify(body),
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
    SignUp,
    GetDiscordUsernameErrors,
    GetDiscordProfilePicture
}
