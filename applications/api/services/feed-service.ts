import Redis from 'shared-server/config/redis'
import DatabaseService from 'shared-server/services/database-service'
import { Sequalize } from 'shared-server/config/database'
import IAccountValueResponse from 'shared-models/dto/iaccount-value-response'
import IOrderHistoryResponse from 'shared-models/dto/feed/iorder-history-response'
import IDisqualificationResponse from 'shared-models/dto/feed/idisqualification-response'
import IFeedParams from 'shared-models/database/ifeed-params'

const feedLimit = 10

/**
 * Retrieves account values from redis and database and returns the merged response
 *
 * @param {number} userId If defined, fetches account values for users in passed users following list
 * @returns {Promise<IAccountValueResponse[]>} List of users with their current account values
 */
const GetAccountValues = async (userId?: number): Promise<IAccountValueResponse[]> => {
    const cachedString = await Redis.get('t212-account-values')
    const accountValues = await DatabaseService.GetCurrentAccountValues(userId)

    if (cachedString === null) return accountValues

    const cachedAccountValues = JSON.parse(cachedString).values as IAccountValueResponse[]
    return accountValues.map(value => {
        const cachedValue = cachedAccountValues.find(cachedValue => cachedValue.user.id === value.user.id)
        return cachedValue === undefined ? value : { user: value.user, values: cachedValue.values }
    })
}

const GetAccountGraph = async (duration: string, params?: IFeedParams) => {
    let startDate = new Date(Date.now())
    startDate.setHours(0, 0, 0)

    if (duration === 'day' && (startDate.getDay() === 0 || startDate.getDay() === 6)) {
        startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 2 : 1))
    }
    else if (duration === 'week') {
        startDate.setDate(startDate.getDate() - 7)
    }
    else if (duration === 'max') {
        startDate.setDate(0)
    }

    let condition = 'true'
    if (params !== undefined) {
        const id = Sequalize.escape(params.userIdentifier)
        condition = params.for === 'profile'
            ? `id = ${id}`
            : `id IN (SELECT followingId FROM Followers WHERE followerId = ${id}) OR id = ${id}`
    }

    return await DatabaseService.GetAccountValues(startDate, duration, condition)
}

/**
 * Fetches order histories and disqualifications from the database, merging results together
 * to form the main, profile or following feed
 *
 * @param {number} offset Number of posts in database to skip
 * @param {IFeedParams} params Object containing discord username or user id and the type of feed being requested
 * @returns {Promise<(IOrderHistoryResponse | IDisqualificationResponse)[]>} Array of merged posts
 */
const GetFeed = async (offset: number, params?: IFeedParams): Promise<(IOrderHistoryResponse | IDisqualificationResponse)[]> => {
    offset = offset === 0 ? 0 : offset -1
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
    GetAccountGraph,
    GetFeed
}
