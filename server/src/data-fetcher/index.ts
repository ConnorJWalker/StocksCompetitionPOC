import 'dotenv/config'
import Redis from '../config/redis'
import DatabaseService from '../services/database-service'
import Trading212Service from '../services/trading212-service'

// start at max so first api response is stored in database
let accountValueResponseCount = 50

const updateAccountValues = async () => {
    const users = await DatabaseService.GetAllUsersWithSecrets()
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
 * Fetch the users cash values from trading 212. This endpoint has a 1
 * request every 5 seconds rate limit. Call once every six seconds to
 * reduce the risk of 429 response
 *
 * Every response is saved to redis with an event published, every 50th api
 * response will be saved to the database
 */
(async () => await updateAccountValues())()
setInterval(async () => await updateAccountValues(), 6000)

