import IAccountValueResponse, { IAccountValuesResponse } from '../dto/feed/i-account-value-response'
import IOrderHistoryResponse from '../dto/feed/iorder-history-response'

export default interface IHomeData {
    chart: IAccountValuesResponse[],
    feed: IOrderHistoryResponse[],
    leaderboards: IAccountValueResponse[]
}
