import IAccountValueResponse, { IAccountValuesResponse } from '../dto/feed/iaccount-value-response'
import IFeedResponse from '../dto/feed/ifeed-response'

export default interface IHomeData {
    chart: IAccountValuesResponse[],
    feed: IFeedResponse[],
    leaderboards: IAccountValueResponse[]
}
