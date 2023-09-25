import IAccountValueResponse, { IAccountValuesResponse } from '../models/dto/feed/i-account-value-response'
import IOrderHistoryResponse from '../models/dto/feed/iorder-history-response'
import ApiService from '../services/api-service'

export interface IHomeData {
    chart: IAccountValuesResponse[],
    feed: IOrderHistoryResponse[],
    leaderboards: IAccountValueResponse[]
}

const HomeLoader = async (): Promise<IHomeData> => {
    const [chart, feed, leaderboards] = await Promise.all([
        ApiService.GetUserCharts(),
        ApiService.GetFeed(),
        ApiService.GetLeaderboards()
    ])

    return {
        chart: chart.content,
        feed,
        leaderboards: leaderboards.content
    }
}

export default HomeLoader
