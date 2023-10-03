import IUser from '../iuser'
import IAccountValueResponse, { IAccountValuesResponse } from '../dto/feed/iaccount-value-response'
import IOpenPositionsResponse from '../dto/profile/iopen-positions-response'
import IFeedResponse from '../dto/feed/ifeed-response'

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
    feed: IFeedResponse[]
}
