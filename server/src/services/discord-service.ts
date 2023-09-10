import IHttpResult from '../models/ihttp-result'
import IGuildMember from '../models/discord/guild-member'

export class DiscordError extends Error {
    responseCode: number

    constructor(message: string, responseCode: number) {
        super(message)
        this.responseCode = responseCode
    }
}

const getUserIndex = (discordUsername: string, guildMembers: IGuildMember[]): number => {
    let userIndex = -1
    guildMembers.some((user, index) => {
        const isUser = user.user.username === discordUsername || user.user.global_name === discordUsername
        if (isUser) {
            userIndex = index
            return true
        }

        return false
    })

    return userIndex
}

const UserIsInDiscord = async (discordUsername: string): Promise<boolean> => {
    if (discordUsername === process.env.DISCORD_BOT_NAME) {
        throw new DiscordError('you are not the discord bot', 400)
    }

    const response = await send<IGuildMember[]>(`guilds/${process.env.DISCORD_SERVER_ID}/members?limit=${process.env.DISCORD_PAGINATION_LIMIT}`)

    if (!response.ok) {
        throw new DiscordError('an error occurred getting guild members', response.statusCode)
    }

    return getUserIndex(discordUsername, response.content!) !== -1
}

const GetProfilePicture = async (discordUsername: string): Promise<string> => {
    const response = await send<IGuildMember[]>(`guilds/${process.env.DISCORD_SERVER_ID}/members?limit=${process.env.DISCORD_PAGINATION_LIMIT}`)

    if (!response.ok) {
        throw new DiscordError('an error occurred getting guild members', response.statusCode)
    }

    const index = getUserIndex(discordUsername, response.content!)
    if (index === -1) {
        throw new DiscordError('user was not found', 404)
    }

    const baseUrl = 'https://cdn.discordapp.com/'

    const user = response.content![index].user
    return user.avatar === null
        ? `${baseUrl}embed/avatars/${user.discriminator === 0 ? user.id >> 22 : user.discriminator % 5}.png`
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
