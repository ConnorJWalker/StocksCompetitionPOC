import 'dotenv/config'
import { SubscriberClient } from '../shared/config/redis'
import DatabaseService from '../shared/services/database-service'
import { IUserWithSecrets } from '../shared/models/iuser'
import OpenPositionsUpdater from './updaters/open-positions-updater'
import AccountValueUpdater from './updaters/account-value-updater'
import DiscordService from '../shared/services/discord-service'

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
        usersRequiresUpdate = false
    }

    await Promise.all([ accountValuesUpdater.update(users), openPositionsUpdater.update(users) ])

    const unauthorisedUsersSet = new Set([ ...accountValuesUpdater.unauthorizedUsers, ...openPositionsUpdater.unauthorizedUsers ])
    const unauthorisedUsersIds = Array.from(unauthorisedUsersSet)

    if (unauthorisedUsersIds.length !== 0) {
        await DatabaseService.InvalidateApiKeys(unauthorisedUsersIds)

        const unauthorisedUsers = users.filter(user => unauthorisedUsersSet.has(user.id))
            .map(user => user.discordUsername)

        try {
            await DiscordService.SendUnauthorisedWarnings(unauthorisedUsers)
        }
        catch (e) {
            console.error(e)
            // TODO: handle not sending properly
        }

        usersRequiresUpdate = true
    }
}, 6000)
