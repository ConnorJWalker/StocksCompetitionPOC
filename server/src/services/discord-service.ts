import IHttpResult from '../models/ihttp-result'
import IGuildMember from '../models/discord/guild-member'
import Redis from '../config/redis'
import IDiscordUser, { DiscordUserFromCache, DiscordUserToCache } from '../models/discord/user'

export class DiscordError extends Error {
    responseCode: number

    constructor(message: string, responseCode: number) {
        super(message)
        this.responseCode = responseCode
    }
}

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

const UserIsInDiscord = async (discordUsername: string): Promise<boolean> => {
    if (discordUsername === process.env.DISCORD_BOT_NAME) {
        throw new DiscordError('you are not the discord bot', 400)
    }

    return await fetchUser(discordUsername) !== null
}

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

const SendWelcomeMessage = async (discordUsername: string, isCompetitor: boolean) => {
    const message = isCompetitor ? 'a competitor' : 'an observer'
    await send(`channels/${process.env.DISCORD_CHANNEL_ID}/messages`, 'post', {
        content: `${discordUsername} joined the competition as ${message}`,
        tts: false
    })
}

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
        content: response.ok ? await response.json() : null
    }
}

export default {
    UserIsInDiscord,
    GetProfilePicture,
    SendWelcomeMessage
}
