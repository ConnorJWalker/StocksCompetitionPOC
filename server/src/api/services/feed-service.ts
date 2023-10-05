import Redis from '../../shared/config/redis'
import DatabaseService from '../../shared/services/database-service'
import IAccountValueResponse from '../../shared/models/dto/iaccount-value-response'
import IOrderHistoryResponse from '../../shared/models/dto/feed/iorder-history-response'
import IDisqualificationResponse from '../../shared/models/dto/feed/idisqualification-response'

export interface FeedParams {
    userIdentifier: string | number
    for: 'profile' | 'following'
}

const feedLimit = 10

/**
 * Retrieves account values from redis and database and returns the merged response
 *
 * @returns {Promise<IAccountValueResponse[]>} List of users with their current account values
 */
const GetAccountValues = async (): Promise<IAccountValueResponse[]> => {
    const cachedString = await Redis.get('t212-account-values')
    const accountValues = await DatabaseService.GetCurrentAccountValues()

    if (cachedString === null) return accountValues

    const cachedAccountValues = JSON.parse(cachedString) as IAccountValueResponse[]
    return accountValues.map(value => {
        const cachedValue = cachedAccountValues.find(cachedValue => cachedValue.user.id === value.user.id)
        return cachedValue === undefined ? value : cachedValue
    })
}

/**
 * Fetches order histories and disqualifications from the database, merging results together
 * to form the main, profile or following feed
 *
 * @param {number} offset Number of posts in database to skip
 * @param {FeedParams} params Object containing discord username or user id and the type of feed being requested
 * @returns {Promise<(IOrderHistoryResponse | IDisqualificationResponse)[]>} Array of merged posts
 */
const GetFeed = async (offset: number, params?: FeedParams): Promise<(IOrderHistoryResponse | IDisqualificationResponse)[]> => {
    const union = await DatabaseService.GetFeedIdUnion(feedLimit, feedLimit * offset, params)
    const unionDisqualifications = union.filter(row => row.postType === 'disqualification')
    const unionOrders = union.filter(row => row.postType === 'order')

    const [disqualifications, orders] = await Promise.all([
        DatabaseService.GetDisqualifiedUsers(unionDisqualifications.map(disqualification => disqualification.UserId)),
        DatabaseService.GetOrders(unionOrders.map(order => order.id))
    ])

    return [...disqualifications , ...orders].sort((value1, value2) => {
        const value1Date = new Date(value1.content.date)
        const value2Date = new Date(value2.content.date)

        if (value1Date > value2Date) return -1
        else if (value1Date < value2Date) return 1
        else return 0
    }) as (IOrderHistoryResponse | IDisqualificationResponse)[]
}

export default {
    GetAccountValues,
    GetFeed
}
