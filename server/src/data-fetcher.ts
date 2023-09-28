import 'dotenv/config'
import Redis from './config/redis'
import DatabaseService from './services/database-service'
import Trading212Service from './services/trading212-service'
import { IUserWithSecrets } from './models/iuser'
import { IPosition } from './models/iopen-positions'
import { IDbOrderHistory } from './models/iorder-history'
import { AccountValueResponseFromT212 } from './models/dto/responses/iaccount-value-response'

// start at max so first api response is stored in database
let accountValueResponseCount = 50

/**
 * Fetch the users cash, invested and gain/loss values from trading 212. Every response is saved to redis
 * with an event published, every 50th api response will be saved to the database
 *
 * @param {IUserWithSecrets[]} users List of users to request the account values for
 */
const updateAccountValues = async (users: IUserWithSecrets[]) => {
    const accountValuePromises = users.map(user => Trading212Service.GetCash(user.apiKey))
    const accountValues = await Promise.all(accountValuePromises)

    if (accountValueResponseCount === 50) {
        await DatabaseService.AddAccountValues(users, accountValues)
    }

    const redisValues = JSON.stringify(AccountValueResponseFromT212(accountValues, users))
    await Redis.set('t212-account-values', redisValues)
    await Redis.publish('account-values-update', redisValues)

    accountValueResponseCount = accountValueResponseCount === 50 ? 0 : accountValueResponseCount + 1
}

/**
 * Fetch users open positions lists from trading 212 and compare against open positions store in database.
 * Add, remove or update records in the database to resemble response from trading 212, adding to OrderHistories
 * if quantities don't match. This method is a workaround for the order history endpoint not currently working
 *
 * @param {IUserWithSecrets[]} users List of users to request the open positions for
 */
const updateOpenPositions = async (users: IUserWithSecrets[]): Promise<void> => {
    const t212OpenPositionsPromises = users.map(user => Trading212Service.GetOpenPositions(user))

    const [t212OpenPositions, dbOpenPositions] = await Promise.all([
        Promise.all(t212OpenPositionsPromises),
        DatabaseService.GetOpenPositions()
    ])

    const newOrderHistory: IDbOrderHistory[] = []
    for (const dbOpenPosition of dbOpenPositions) {
        const handled = new Set<string>()
        const removedPositions: IPosition[] = []
        const updatedPositions: IPosition[] = []

        const t212OpenPosition = t212OpenPositions.find(position => position.user.id === dbOpenPosition.user.id)

        if (t212OpenPosition === undefined) {
            throw new Error(`Could not find user ${dbOpenPosition.user.discordUsername} in t212 result`)
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
    const users = await DatabaseService.GetAllUsersWithSecrets()

    await Promise.all([
        updateAccountValues(users),
        updateOpenPositions(users)
    ])
}, 6000)
