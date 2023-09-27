import IUser from '../iuser'
import IAccountValueResponse, { IAccountValuesResponse } from '../dto/feed/i-account-value-response'
import IOpenPositionsResponse from '../dto/profile/iopen-positions-response'
import IOrderHistoryResponse from '../dto/feed/iorder-history-response'

export interface IProfileData {
    profileUser: IUser
    accountValue: {
        position: string
        value?: IAccountValueResponse
    }
    openPositions: IOpenPositionsResponse[]
}

export default interface IProfileLoaderData {
    userInfo: IProfileData,
    userChart: IAccountValuesResponse[],
    feed: IOrderHistoryResponse[]
}
