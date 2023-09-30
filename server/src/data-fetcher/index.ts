import 'dotenv/config'
import Redis, { SubscriberClient } from '../shared/config/redis'
import DatabaseService from '../shared/services/database-service'
import Trading212Service, { Trading212Error } from '../shared/services/trading212-service'
import IUser, { IUserWithSecrets } from '../shared/models/iuser'
import IOpenPositions, { IPosition } from '../shared/services/iopen-positions'
import { IDbOrderHistory } from '../shared/models/iorder-history'
import { AccountValueResponseFromT212 } from '../shared/models/dto/iaccount-value-response'
import { FailureReason } from '../shared/models/ihttp-result'
import IAccountValue from '../shared/models/iaccount-value'

// start at max so first api response is stored in database
let accountValueResponseCount = 50

// store users and update on users update redis event
let users: IUserWithSecrets[] = []
let usersRequiresUpdate = false
SubscriberClient.subscribe('user-update', () => usersRequiresUpdate = true).then(/* Ignore */)

/**
 * Maps list of settled promises into their resolved state, handling expired api keys and
 * rate limit errors
 *
 * @param {PromiseSettledResult<T>[]} settled List of settled promises from trading 212 service
 * @returns {T[]} Array of resolved promise results
 */
const processTrading212Promises = async <T>(settled: PromiseSettledResult<T>[]): Promise<(T | null)[]> => {
    let usersWithExpiredKeys: number[] = []
    const resolved = settled.map((value, index) => {
        if (value.status === 'fulfilled') return value.value

        const error = value.reason as Trading212Error
        if (error.reason === FailureReason.Unauthorised) {
            usersWithExpiredKeys.push(users[index].id)
        }

        return null
    })

    if (usersWithExpiredKeys.length !== 0) {
        await DatabaseService.InvalidateApiKeys(usersWithExpiredKeys)
        usersRequiresUpdate = true
    }

    return resolved
}

/**
 * Fetch the users cash, invested and gain/loss values from trading 212. Every response is saved to redis
 * with an event published, every 50th api response will be saved to the database
 */
const updateAccountValues = async () => {
    const accountValuePromises = users.map(user => Trading212Service.GetCash(user.apiKey))
    const accountValuesSettled = await Promise.allSettled(accountValuePromises)
    const accountValues = await processTrading212Promises(accountValuesSettled)

    const usersToSave: IUser[] = []
    const accountValuesToSave = accountValues.filter((value, index) => {
        if (value === null) return false

        usersToSave.push(users[index])
        return true
    }) as IAccountValue[]

    if (accountValueResponseCount === 50) {
        await DatabaseService.AddAccountValues(usersToSave, accountValuesToSave)
    }

    const redisValues = JSON.stringify(AccountValueResponseFromT212(accountValuesToSave, usersToSave))
    await Redis.set('t212-account-values', redisValues)
    await Redis.publish('account-values-update', redisValues)

    accountValueResponseCount = accountValueResponseCount === 50 ? 0 : accountValueResponseCount + 1
}

/**
 * Fetch users open positions lists from trading 212 and compare against open positions store in database.
 * Add, remove or update records in the database to resemble response from trading 212, adding to OrderHistories
 * if quantities don't match. This method is a workaround for the order history endpoint not currently working
 */
const updateOpenPositions = async (): Promise<void> => {
    const t212OpenPositionsPromises = users.map(user => Trading212Service.GetOpenPositions(user))

    const dbOpenPositions = await DatabaseService.GetOpenPositions()
    const t212OpenPositionsSettled = await Promise.allSettled(t212OpenPositionsPromises)
    const t212OpenPositions = await processTrading212Promises(t212OpenPositionsSettled)
    const t212OpenPositionsToSave = t212OpenPositions.filter(value => value !== null) as IOpenPositions[]

    const newOrderHistory: IDbOrderHistory[] = []
    for (const dbOpenPosition of dbOpenPositions) {
        const handled = new Set<string>()
        const removedPositions: IPosition[] = []
        const updatedPositions: IPosition[] = []

        const t212OpenPosition = t212OpenPositionsToSave.find(position => position.user.id === dbOpenPosition.user.id)

        if (t212OpenPosition === undefined) {
            // throw new Error(`Could not find user ${dbOpenPosition.user.discordUsername} in t212 result`)
            // TODO: add a disqualification strike
            return
        }

        dbOpenPosition.positions.forEach(position => {
            const t212Position = t212OpenPosition.positions.find(searchPosition =>
                searchPosition.trading212Ticker === position.trading212Ticker
            )

            if (t212Position === undefined) {
                removedPositions.push(position)
                newOrderHistory.push({
                    userId: dbOpenPosition.user.id,
                    type: 'sell',
                    averagePrice: 0, // how to get???
                    quantity: position.quantity,
                    trading212Ticker: position.trading212Ticker
                })
            }
            // If returned quantity is different to stored quantity by more than the database will truncate, add to database
            else if (t212Position.quantity !== position.quantity && Math.abs(t212Position.quantity - position.quantity) > 0.000009) {
                updatedPositions.push({ ...position, quantity: t212Position.quantity })
                newOrderHistory.push({
                    userId: dbOpenPosition.user.id,
                    type: t212Position.quantity > position.quantity ? 'buy' : 'sell',
                    averagePrice: t212Position.currentPrice!,
                    quantity: Math.abs(t212Position.quantity - position.quantity),
                    trading212Ticker: t212Position.trading212Ticker
                })
            }

            handled.add(position.trading212Ticker)
        })

        const newPositions = t212OpenPosition.positions.filter(position => {
            const isNew = !handled.has(position.trading212Ticker)

            if (isNew) {
                newOrderHistory.push({
                    userId: dbOpenPosition.user.id,
                    type: 'buy',
                    averagePrice: position.currentPrice!,
                    quantity: position.quantity,
                    trading212Ticker: position.trading212Ticker
                })

                return true
            }

            return false
        })

        await DatabaseService.UpdateOpenPositions(dbOpenPosition.user, newPositions, updatedPositions, removedPositions)
    }

    await DatabaseService.AddOrders(newOrderHistory)
}

/**
 * Update the users account values and open positions from trading212. These endpoints have a rate limit
 * of 1 request every 5 seconds, call every 6 seconds to reduce chance of 429 response
 */
setInterval(async () => {
    if (users.length === 0 || usersRequiresUpdate) {
        users = await DatabaseService.GetAllUsersWithValidApiKeys()
    }

    await Promise.all([
        updateAccountValues(),
        updateOpenPositions()
    ])
}, 6000)
