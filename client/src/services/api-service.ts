import ILoginForm from '../models/dto/ilogin-form'
import ISignupForm from '../models/dto/isignup-form'
import IHttpResult, { IHttpErrorResult } from '../models/ihttp-result'
import IProfilePicture from '../models/dto/iprofile-picture'
import IAuthenticationResponse from '../models/dto/iauthentication-response'
import AuthenticationService from './authentication-service'
import IAccountValueResponse, { IAccountValuesResponse } from '../models/dto/feed/i-account-value-response'
import IOrderHistoryResponse from '../models/dto/feed/iorder-history-response'
import IUser from '../models/iuser'
import IOpenPositionsResponse from '../models/dto/profile/iopen-positions-response'

export class HttpError extends Error {
    public statusCode: number
    public response: IHttpErrorResult

    constructor(httpResult: IHttpResult<IHttpErrorResult>) {
        super()

        this.statusCode = httpResult.statusCode
        this.response = httpResult.content
    }
}

const Login = async (loginForm: ILoginForm): Promise<IAuthenticationResponse> => {
    const response = await sendWithoutAuth<IAuthenticationResponse>(
        'authentication/login',
        'post',
        loginForm
    )

    if (response.ok) {
        return response.content as IAuthenticationResponse
    }

    throw new HttpError(response as IHttpResult<IHttpErrorResult>)
}

const SignUp = async (signupForm: ISignupForm): Promise<IAuthenticationResponse> => {
    const response = await sendWithoutAuth<IAuthenticationResponse>(
        'authentication/signup',
        'post',
        signupForm
    )

    if (response.ok) {
        return response.content as IAuthenticationResponse
    }

    throw new HttpError(response as IHttpResult<IHttpErrorResult>)
}

const Refresh = async (token: string): Promise<IAuthenticationResponse | null> => {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}authentication/refresh`, {
        method: 'post',
        headers: new Headers({
            'content-type': 'application/json',
            'authorization': 'Bearer ' + token
        })
    })

    return response.ok ? await response.json() as IAuthenticationResponse : null
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

const GetLeaderboards = async (): Promise<IHttpResult<IAccountValueResponse[]>> => {
    const response = await send<IAccountValueResponse[]>('feed/accountValues')
    response.content = response.content.sort((a, b) => {
        if (a.values.total < b.values.total) return 1
        else if (a.values.total > b.values.total) return -1
        else return 0
    })

    return response
}

const GetUserCharts = async (discordUsername?: string): Promise<IHttpResult<IAccountValuesResponse[]>> => {
    const endpoint = discordUsername === undefined
        ? 'feed/accountValues/graph'
        : `profile/accountValue/graph/${discordUsername}`

    return await send<IAccountValuesResponse[]>(endpoint)
}

const GetFeed = async (discordUsername?: string): Promise<IOrderHistoryResponse[]> => {
    const endpoint = discordUsername === undefined
        ? 'feed'
        : `profile/feed/${discordUsername}`

    const response = await send<IOrderHistoryResponse[]>(endpoint)
    return response.content
}

const GetProfileUser = async (discordUsername: string): Promise<IUser> => {
    const response = await send<IUser>(`profile/user/${discordUsername}`)
    return response.content
}

const GetOpenPositions = async (discordUsername: string): Promise<IOpenPositionsResponse[]> => {
    const response = await send<IOpenPositionsResponse[]>(`profile/openPositions/${discordUsername}`)
    return response.content
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

const send = async <T>(endpoint: string, method = 'get', body: object | null = null): Promise<IHttpResult<T>> => {
    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}${endpoint}`, {
        method,
        body: method === 'get' ? undefined : JSON.stringify(body),
        headers: new Headers({
            'content-type': 'application/json',
            'authorization': 'Bearer ' + localStorage.getItem('accessToken') || '',
        })
    })
    
    if (response.status === 401 && await AuthenticationService.Refresh()) {
        return send(endpoint, method, body)
    }
    else if (response.status === 401) {
        AuthenticationService.LogOut()
    }

    const result = {
        ok: response.ok,
        statusCode: response.status,
        content: await response.json()
    }

    if (!response.ok) {
        throw new HttpError(result as IHttpResult<IHttpErrorResult>)
    }

    return result
}

export default {
    Login,
    SignUp,
    Refresh,
    GetDiscordUsernameErrors,
    GetDiscordProfilePicture,
    GetLeaderboards,
    GetUserCharts,
    GetFeed,
    GetProfileUser,
    GetOpenPositions
}
