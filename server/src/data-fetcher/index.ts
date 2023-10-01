import 'dotenv/config'
import { SubscriberClient } from '../shared/config/redis'
import DatabaseService from '../shared/services/database-service'
import { IUserWithSecrets } from '../shared/models/iuser'
import OpenPositionsUpdater from './updaters/open-positions-updater'
import AccountValueUpdater from './updaters/account-value-updater'

// store users and update on users update redis event
let users: IUserWithSecrets[] = []
let usersRequiresUpdate = false
SubscriberClient.subscribe('user-update', () => usersRequiresUpdate = true).then(/* Ignore */)

const openPositionsUpdater = new OpenPositionsUpdater()
const accountValuesUpdater = new AccountValueUpdater(50, 25)

/**
 * Update the users account values and open positions from trading212. These endpoints have a rate limit
 * of 1 request every 5 seconds, call every 6 seconds to reduce chance of 429 response
 */
setInterval(async () => {
    if (users.length === 0 || usersRequiresUpdate) {
        users = await DatabaseService.GetAllUsersWithValidApiKeys()
    }

    await Promise.all([ accountValuesUpdater.update(users), openPositionsUpdater.update(users) ])

    const unauthorisedUsers = Array.from(new Set([ ...accountValuesUpdater.unauthorizedUsers, ...openPositionsUpdater.unauthorizedUsers ]))
    if (unauthorisedUsers.length !== 0) {
        await DatabaseService.InvalidateApiKeys(unauthorisedUsers)
        usersRequiresUpdate = true
    }
}, 6000)
