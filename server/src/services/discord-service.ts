import IHttpResult from '../models/ihttp-result'
import IGuildMember from '../models/discord/guild-member'

export class DiscordError extends Error {
    responseCode: number

    constructor(message: string, responseCode: number) {
        super(message)
        this.responseCode = responseCode
    }
}

const UserIsInDiscord = async (discordUsername: string): Promise<boolean> => {
    const response = await send<IGuildMember[]>(`guilds/${process.env.DISCORD_SERVER_ID}/members`)

    if (!response.ok) {
        throw new DiscordError('an error occurred getting guild members', response.statusCode)
    }

    let userExists = false
    response.content!.forEach(member => {
        if (member.user.username === discordUsername) userExists = true
    })

    return userExists
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
    SendWelcomeMessage
}
