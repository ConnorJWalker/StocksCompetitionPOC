import 'dotenv/config'
import { SubscriberClient } from '../shared/config/redis'
import DatabaseService from '../shared/services/database-service'
import { IUserWithSecrets } from '../shared/models/iuser'
import OpenPositionsUpdater from './updaters/open-positions-updater'
import AccountValueUpdater from './updaters/account-value-updater'
import DiscordService from '../shared/services/discord-service'

const maxDisqualificationStrikes = parseInt(process.env.MAX_DISQUALIFICATION_STRIKES!)
const updateDatabaseAt = parseInt(process.env.UPDATE_DATABASE_AT!)
const maxCashPercentage = parseInt(process.env.MAX_CASH_PERCENTAGE!)

// store users and update on users update redis event
let users: IUserWithSecrets[] = []
let usersRequiresUpdate = false
SubscriberClient.subscribe('user-update', () => usersRequiresUpdate = true).then(/* Ignore */)

const openPositionsUpdater = new OpenPositionsUpdater()
const accountValuesUpdater = new AccountValueUpdater(updateDatabaseAt, maxCashPercentage)

/**
 * Gets array of unauthorised users from updaters and marks their keys as invalid in database, sending warning
 * on discord
 */
const handleUnauthorisedUsers = async () => {
    const unauthorisedUsersSet = new Set([ ...accountValuesUpdater.unauthorizedUsers, ...openPositionsUpdater.unauthorizedUsers ])
    const unauthorisedUsersIds = Array.from(unauthorisedUsersSet)

    if (unauthorisedUsersIds.length === 0) return

    await DatabaseService.InvalidateApiKeys(unauthorisedUsersIds)

    const unauthorisedUsers = users.filter(user => unauthorisedUsersSet.has(user.id))
        .map(user => user.discordUsername)

    try {
        await DiscordService.SendUnauthorisedWarnings(unauthorisedUsers)
    }
    catch (e) {
        console.error(e)
    }

    usersRequiresUpdate = true
}

/**
 * Increments disqualification strikes for all users who are either unauthorised or have too much cash, sending
 * disqualification message and removing them from the competition if max strikes has been reached
 */
const handleDisqualifications = async () => {
    if (accountValuesUpdater.userIdsToStrike.length === 0) return

    await DatabaseService.IncrementDisqualificationStrikes(accountValuesUpdater.userIdsToStrike)
    const disqualifiedUsers = await DatabaseService.DisqualifyUsers(maxDisqualificationStrikes)

    const newlyDisqualifiedUsers = users.filter(user => disqualifiedUsers.includes(user.discordUsername))
        .map(user => user.discordUsername)

    if (newlyDisqualifiedUsers.length === 0) return

    try {
        await DiscordService.SendDisqualificationMessage(newlyDisqualifiedUsers)
    }
    catch (e) {
        console.error(e)
    }

    usersRequiresUpdate = true
}

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
    await handleUnauthorisedUsers()
    await handleDisqualifications()
}, 6000)
