import 'dotenv/config'
import Redis from '../config/redis'
import DatabaseService from '../services/database-service'
import Trading212Service from '../services/trading212-service'
import { IUserWithSecrets } from '../models/iuser'
import { IPosition } from '../models/dto/responses/iopen-positions'

// start at max so first api response is stored in database
let accountValueResponseCount = 50;

/**
 * Fetch the users cash, invested and gain/loss values from trading 212. Every response is saved to redis
 * with an event published, every 50th api response will be saved to the database
 *
 * @param {IUserWithSecrets[]} users List of users to request the account values for
 */
const updateAccountValues = async (users: IUserWithSecrets[]) => {
    const accountValuePromises = users.map(user => Trading212Service.GetCash(user.apiKey))
    const accountValues = await Promise.all(accountValuePromises)

    const redisValues = JSON.stringify(accountValues.map((accountValue, index) => ({
        ...accountValue,
        discordUsername: users[index].discordUsername
    })))

    if (accountValueResponseCount === 50) {
        await DatabaseService.AddAccountValues(users, accountValues)
    }

    await Redis.set('t212-account-values', redisValues)
    accountValueResponseCount = accountValueResponseCount === 50 ? 0 : accountValueResponseCount + 1
}

/**
 * Fetch users open positions lists from trading 212 and compare against open positions store in database.
 * Add, remove or update records in the database to resemble response from trading 212. This method is a
 * workaround for the order history endpoint not currently working
 *
 * @param {IUserWithSecrets[]} users List of users to request the open positions for
 */
const updateOpenPositions = async (users: IUserWithSecrets[]): Promise<void> => {
    const t212OpenPositionsPromises = users.map(user => Trading212Service.GetOpenPositions(user))

    const [t212OpenPositions, dbOpenPositions] = await Promise.all([
        Promise.all(t212OpenPositionsPromises),
        DatabaseService.GetOpenPositions()
    ])

    for (const dbOpenPosition of dbOpenPositions) {
        const handled = new Set<string>()
        const removedPositions: IPosition[] = []
        const updatedPositions: IPosition[] = []

        const t212OpenPosition = t212OpenPositions.find(position => {
            return position.user.id === dbOpenPosition.user.id
        })

        if (t212OpenPosition === undefined) {
            throw new Error(`Could not find user ${dbOpenPosition.user.discordUsername} in t212 result`)
        }

        dbOpenPosition.positions.forEach(position => {
            const t212Position = t212OpenPosition.positions.find(searchPosition => {
                return searchPosition.trading212Ticker === position.trading212Ticker
            })

            if (t212Position === undefined) {
                removedPositions.push(position)
            }
            else if (t212Position.quantity !== position.quantity) {
                updatedPositions.push({ ...position, quantity: t212Position.quantity })
            }

            handled.add(position.trading212Ticker)
        })

        const newPositions = t212OpenPosition.positions.filter(position => {
            return !handled.has(position.trading212Ticker)
        })

        await DatabaseService.UpdateOpenPositions(dbOpenPosition.user, newPositions, updatedPositions, removedPositions)
    }
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
