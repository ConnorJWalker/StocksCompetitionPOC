import IUser from '../models/iuser'
import IAccountValueResponse, { IAccountValuesResponse } from '../models/dto/feed/i-account-value-response'
import IOpenPositionsResponse from '../models/dto/profile/iopen-positions-response'
import ApiService from '../services/api-service'
import getPositionSuffix from '../utils/getPositionSuffix'
import IOrderHistoryResponse from '../models/dto/feed/iorder-history-response'

export interface IProfileData {
    profileUser: IUser
    accountValue: {
        position: string
        value?: IAccountValueResponse
    }
    openPositions: IOpenPositionsResponse[]
}

export interface IProfileLoaderData {
    userInfo: IProfileData,
    userChart: IAccountValuesResponse[],
    feed: IOrderHistoryResponse[]
}

const ProfileLoader = async (discordUsername: string): Promise<IProfileLoaderData> => {
    const [userInfo, accountValues, openPositions, userChart, feed] = await Promise.all([
        ApiService.GetProfileUser(discordUsername),
        ApiService.GetLeaderboards(),
        ApiService.GetOpenPositions(discordUsername),
        ApiService.GetUserCharts(discordUsername),
        ApiService.GetFeed(discordUsername)
    ])

    const position = accountValues.content.findIndex(value => value.user.discordUsername === discordUsername) + 1

    return {
        userInfo: {
            profileUser: userInfo,
            accountValue: {
                position: `${position}${getPositionSuffix(position)}`,
                value: accountValues.content.find(value => value.user.discordUsername === discordUsername)
            },
            openPositions
        },
        userChart: userChart.content,
        feed
    }
}

export default ProfileLoader
