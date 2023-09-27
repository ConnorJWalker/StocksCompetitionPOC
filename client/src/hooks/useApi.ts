import ILoginForm from '../models/dto/ilogin-form'
import IHttpResult, { IHttpErrorResult } from '../models/ihttp-result'
import IAuthenticationResponse from '../models/dto/iauthentication-response'
import HttpError from '../models/http-error'
import ISignupForm from '../models/dto/isignup-form'
import IProfilePicture from '../models/dto/iprofile-picture'

const useApi = () => {
    const send = async <T>(endpoint: string, method: string = 'get', body: object | null = null): Promise<IHttpResult<T | IHttpErrorResult>> => {
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

    const login = async (loginForm: ILoginForm): Promise<IAuthenticationResponse> => {
        const response = await send<IAuthenticationResponse>(
            'authentication/login',
            'post',
            loginForm
        )

        if (response.ok) {
            return response.content as IAuthenticationResponse
        }

        throw new HttpError(response as IHttpResult<IHttpErrorResult>)
    }

    const signup = async (signupForm: ISignupForm): Promise<IAuthenticationResponse> => {
        const response = await send<IAuthenticationResponse>(
            'authentication/signup',
            'post',
            signupForm
        )

        if (response.ok) {
            return response.content as IAuthenticationResponse
        }

        throw new HttpError(response as IHttpResult<IHttpErrorResult>)
    }

    const getDiscordProfilePicture = async (discordUsername: string): Promise<string | undefined> => {
        const response = await send<IProfilePicture>(`authentication/profile-picture/${discordUsername}`)

        if (!response.ok) return
        return (response.content as IProfilePicture).profilePicture
    }

    return {
        login,
        signup,
        getDiscordProfilePicture
    }
}

export default useApi
