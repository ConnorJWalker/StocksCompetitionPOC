import IHttpResult from 'shared-models/ihttp-result'
import IGuildMember from 'shared-models/discord/guild-member'
import Redis from '../config/redis'
import IDiscordUser, { DiscordUserFromCache, DiscordUserToCache } from 'shared-models/discord/user'

export class DiscordError extends Error {
    responseCode: number

    constructor(message: string, responseCode: number) {
        super(message)
        this.responseCode = responseCode
    }
}

/**
 * Searches redis cache for discord user object then requests discords api for the user object if not
 * currently stored in redis. Refreshed cache with each request to discord
 *
 * @param {string} discordUsername Username to search discord server for
 * @returns {Promise<IDiscordUser | null>} IDiscordUser if user was found in server, null if not found
 * @throws {DiscordError} Thrown when user was not found in cache and discord return non 200 response
 */
const fetchUser = async (discordUsername: string): Promise<IDiscordUser | null> => {
    const cachedUser = await Redis.hGetAll(`discord:${discordUsername}`)

    if (cachedUser['id'] !== undefined) {
        return DiscordUserFromCache(cachedUser)
    }

    const response = await send<IGuildMember[]>(`guilds/${process.env.DISCORD_SERVER_ID}/members?limit=${process.env.DISCORD_PAGINATION_LIMIT}`)

    if (!response.ok) {
        throw new DiscordError('an error occurred getting guild members', response.statusCode)
    }

    let user: IDiscordUser | null = null
    for (const guildMember of response.content || []) {
        if (guildMember.user.global_name === discordUsername) {
            user = guildMember.user
        }

        const redisKey = `discord:${guildMember.user.global_name}`
        if (guildMember.user.global_name) {
            await Redis.hSet(redisKey, DiscordUserToCache(guildMember.user))
            await Redis.expire(redisKey, 600)
        }
    }

    return user
}

/**
 * Searches the discord server for a user with a matching discord username
 *
 * @param {string} discordUsername Username of user to search for
 * @returns {Promise<boolean>} True if user was found in discord server, false if not
 * @throws {DiscordError} Thrown when provided username is same as bots username
 * @async
 */
const UserIsInDiscord = async (discordUsername: string): Promise<boolean> => {
    if (discordUsername === process.env.DISCORD_BOT_NAME) {
        throw new DiscordError('you are not the discord bot', 400)
    }

    return await fetchUser(discordUsername) !== null
}

/**
 * Converts user object returned from discords api into profile picture url
 *
 * @see {@link https://discord.com/developers/docs/reference#image-formatting}
 * @param {string} discordUsername Username of user to get profile picture of
 * @returns {Promise<string>} Url to users profile picture
 * @throws {DiscordError} Thrown when the user could not be found in the server
 * @async
 */
const GetProfilePicture = async (discordUsername: string): Promise<string> => {
    const user = await fetchUser(discordUsername)
    if (user === null) {
        throw new DiscordError('user was not found', 404)
    }

    const baseUrl = 'https://cdn.discordapp.com/'
    return !user.avatar
        ? `${baseUrl}embed/avatars/${user.discriminator === 0 ? (Number(user.id) >> 22) % 6 : user.discriminator % 5}.png`
        : `${baseUrl}avatars/${user.id}/${user.avatar}.png`
}

/**
 * Sends message welcoming user to the competition
 *
 * @param {string} discordUsername Username of user to welcome
 * @param {boolean} isCompetitor True if user is competing and provided api key
 * @async
 */
const SendWelcomeMessage = async (discordUsername: string, isCompetitor: boolean) => {
    const message = isCompetitor ? 'a competitor' : 'an observer'
    await send(`channels/${process.env.DISCORD_CHANNEL_ID}/messages`, 'post', {
        content: `${discordUsername} joined the competition as ${message}`,
        tts: false
    })
}

/**
 * Sends warning message for users who got an unauthorised response from trading212
 *
 * @param {string[]} discordUsernames Array of discord usernames to warn
 * @async
 */
const SendUnauthorisedWarnings = async (discordUsernames: string[]) => {{
    const usersString = discordUsernames.join(', ')
    const plural = discordUsernames.length > 1

    const message = `${usersString} your apiKey${plural ? 's' : ''} are no longer authorised `
        + `please provide a new api key, your disqualification countdown${plural ? 's have' : ' has'} started`

    await send(`channels/${process.env.DISCORD_CHANNEL_ID}/messages`, 'post', {
        content: message,
        tts: false
    })
}}

/**
 * Sends message alerting of user disqualifications
 *
 * @param {string[]} discordUsernames Array of discord usernames for disqualified users
 */
const SendDisqualificationMessage = async (discordUsernames: string[]) => {
    const usersString = discordUsernames.join(', ')
    const message = `${usersString} ${discordUsernames.length > 1 ? 'have' : 'has'} been disqualified`

    await send(`channels/${process.env.DISCORD_CHANNEL_ID}/messages`, 'post', {
        content: message,
        tts: false
    })
}

/**
 * Sends request to the discord api with required headers, parsing the received response
 *
 * @template T
 * @param {string} endpoint Discord api endpoint to send request to
 * @param {string} method Http method to use
 * @param {object | undefined} body Http request body. Only applies when method is not get
 * @returns {Promise<IHttpResult<T | null>>} Promise containing parsed response body or null on non 200 response
 * @async
 */
const send = async <T>(endpoint: string, method: string = 'get', body: object | undefined = undefined): Promise<IHttpResult<T | null>> => {
    const response = await fetch(`${process.env.DISCORD_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    return {
        ok: response.ok,
        statusCode: response.status,
        content: response.ok ? await response.json() as T : null
    }
}

export default {
    UserIsInDiscord,
    GetProfilePicture,
    SendWelcomeMessage,
    SendUnauthorisedWarnings,
    SendDisqualificationMessage
}
