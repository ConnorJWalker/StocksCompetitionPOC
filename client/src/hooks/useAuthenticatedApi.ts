import IHttpResult, { IHttpErrorResult } from '../models/ihttp-result'
import IAccountValueResponse, { IAccountValuesResponse } from '../models/dto/feed/iaccount-value-response'
import HttpError from '../models/http-error'
import useAuthentication from './authentication-context'
import orderLeaderboards from '../utils/order-leaderboards'
import IOpenPositionsResponse from '../models/dto/profile/iopen-positions-response'
import getPositionSuffix from '../utils/get-position-suffix'
import IProfileData from '../models/pages/iprofile-data'
import IFeedResponse from '../models/dto/feed/ifeed-response'
import IAuthenticationResponse from '../models/dto/iauthentication-response'
import { useEffect } from 'react'

let refreshPromise: Promise<IAuthenticationResponse | null> | null = null

let loadingContent = false
let allContentLoaded = false
let currentPage = 0

interface Params {
    discordUsername?: string
    followingOnly?: boolean
}

const useAuthenticatedApi = () => {
    const { accessToken, refreshToken, setTokens } = useAuthentication()

    useEffect(() => { refreshPromise = null }, [accessToken])

    const refreshAccessTokens = async (): Promise<IAuthenticationResponse | null> => {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}authentication/refresh`, {
            method: 'post',
            headers: new Headers({
                'content-type': 'application/json',
                'authorization': 'Bearer ' + refreshToken
            })
        })

        const body = response.ok ? await response.json() : undefined
        setTokens(body)
        return response.ok ? body : null
    }

    const send = async <T>(endpoint: string, method = 'get', body: object | null = null, newToken?: string): Promise<IHttpResult<T>> => {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}${endpoint}`, {
            method,
            body: method === 'get' ? undefined : JSON.stringify(body ?? {}),
            headers: new Headers({
                'content-type': 'application/json',
                'authorization': 'Bearer ' + (newToken === undefined ? accessToken : newToken),
            })
        })

        if (response.status === 401 && newToken === undefined) {
            if (refreshPromise === null) {
                refreshPromise = refreshAccessTokens()
            }

            const token = await refreshPromise
            if (token !== null) {
                return await send(endpoint, method, body, token.accessToken)
            }
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

    const getUserInfo = async (discordUsername: string): Promise<IProfileData> => {
        const [isFollowing, accountValues, openPositions] = await Promise.all([
            send<{ isFollowing: boolean }>(`user/follow/${discordUsername}`),
            send<IAccountValueResponse[]>('feed/accountValues'),
            send<IOpenPositionsResponse[]>(`profile/openPositions/${discordUsername}`)
        ])

        const sortedLeaderboards = orderLeaderboards(accountValues.content)
        const position = sortedLeaderboards.findIndex(value => value.user.discordUsername === discordUsername) + 1
        const userAccountValue = sortedLeaderboards.find(value => value.user.discordUsername === discordUsername)

        return {
            isFollowing: isFollowing.content.isFollowing,
            accountValue: {
                position: position + getPositionSuffix(position),
                value: userAccountValue!
            },
            openPositions: openPositions.content
        }
    }

    const getChart = async (duration: string = 'day', params?: Params): Promise<IAccountValuesResponse[]> => {
        let endpoint = `feed/accountValues/graph?duration=${duration}`

        if (params?.followingOnly !== undefined || params?.discordUsername !== undefined) {
            endpoint = params.discordUsername === undefined
                ? `following/accountValues/graph?duration=${duration}`
                : `profile/accountValue/graph/${params.discordUsername}?duration=${duration}`
        }

        const response = await send<IAccountValuesResponse[]>(endpoint)
        return response.content
    }

    const getFeed = async (params?: Params): Promise<[boolean, IFeedResponse[]]> => {
        if (loadingContent || allContentLoaded) return [false, []]

        loadingContent = true
        let endpoint = `feed?page=${currentPage}`
        if (params !== undefined) {
            endpoint = params?.discordUsername === undefined
                ? `following?page=${currentPage}`
                : `profile/feed/${params.discordUsername}?page=${currentPage}`
        }

        const response = (await send<IFeedResponse[]>(endpoint)).content
        if (response.length === 0) allContentLoaded = true

        currentPage++
        loadingContent = false
        return [true, response]
    }

    const sendFollowRequest = async (discordUsername: string): Promise<void> => {
        await send(`user/follow/${discordUsername}`, 'post')
    }

    const getLeaderboards = async (controller: string): Promise<IAccountValueResponse[]> => {
        const response = await send<IAccountValueResponse[]>(`${controller}/accountValues`)
        return orderLeaderboards(response.content)
    }

    const resetPagination = () => {
        loadingContent = false
        allContentLoaded = false
        currentPage = 0
    }

    return {
        getUserInfo,
        getChart,
        getFeed,
        sendFollowRequest,
        getLeaderboards,
        resetPagination
    }
}

export default useAuthenticatedApi
