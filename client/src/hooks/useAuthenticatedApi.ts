import IHttpResult, { IHttpErrorResult } from '../models/ihttp-result'
import IAccountValueResponse, { IAccountValuesResponse } from '../models/dto/feed/i-account-value-response'
import HttpError from '../models/http-error'
import IHomeData from '../models/pages/ihome-data'
import IOrderHistoryResponse from '../models/dto/feed/iorder-history-response'
import useAuthentication from './authentication-context'
import orderLeaderboards from '../utils/order-leaderboards'
import IUser from '../models/iuser'
import IOpenPositionsResponse from '../models/dto/profile/iopen-positions-response'
import getPositionSuffix from '../utils/get-position-suffix'
import IProfileLoaderData from '../models/pages/iprofile-data'
import { useUserContext } from './user-context'

const useAuthenticatedApi = () => {
    const user = useUserContext()
    const { accessToken, refreshToken, setTokens } = useAuthentication()

    const send = async <T>(endpoint: string, method = 'get', body: object | null = null): Promise<IHttpResult<T>> => {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}${endpoint}`, {
            method,
            body: method === 'get' ? undefined : JSON.stringify(body),
            headers: new Headers({
                'content-type': 'application/json',
                'authorization': 'Bearer ' + accessToken,
            })
        })

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

    const validateRefreshToken = async () => {
        // if access token expires in less than 60 seconds
        if ((user.exp * 1000) - Date.now() < 60 * 1000) {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}authentication/refresh`, {
                method: 'post',
                headers: new Headers({
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + refreshToken
                })
            })

            setTokens(response.ok ? await response.json() : undefined)
        }
    }

    const getHomeData = async (): Promise<IHomeData> => {
        await validateRefreshToken()

        const [chart, feed, leaderboards] = await Promise.all([
            send<IAccountValuesResponse[]>('feed/accountValues/graph'),
            send<IOrderHistoryResponse[]>('feed'),
            send<IAccountValueResponse[]>('feed/accountValues')
        ])

        return {
            chart: chart.content,
            feed: feed.content,
            leaderboards: orderLeaderboards(leaderboards.content)
        }
    }

    const getProfileData = async (discordUsername: string): Promise<IProfileLoaderData> => {
        await validateRefreshToken()

        const [userInfo, accountValues, openPositions, userChart, feed] = await Promise.all([
            send<IUser>(`profile/user/${discordUsername}`),
            send<IAccountValueResponse[]>('feed/accountValues'),
            send<IOpenPositionsResponse[]>(`profile/openPositions/${discordUsername}`),
            send<IAccountValuesResponse[]>(`profile/accountValue/graph/${discordUsername}`),
            send<IOrderHistoryResponse[]>(`profile/feed/${discordUsername}`)
        ])

        const sortedLeaderboards = orderLeaderboards(accountValues.content)
        const position = sortedLeaderboards.findIndex(value => value.user.discordUsername === discordUsername) + 1
        const userAccountValue = sortedLeaderboards.find(value => value.user.discordUsername === discordUsername)

        return {
            userInfo: {
                profileUser: userInfo.content,
                accountValue: {
                    position: position + getPositionSuffix(position),
                    value: userAccountValue
                },
                openPositions: openPositions.content
            },
            userChart: userChart.content,
            feed: feed.content
        }
    }

    return {
        getHomeData,
        getProfileData
    }
}

export default useAuthenticatedApi
