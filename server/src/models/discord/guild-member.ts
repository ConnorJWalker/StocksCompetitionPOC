import IDiscordUser from './user'

export default interface IGuildMember {
    avatar: string
    communication_disabled_until: string
    flags: number
    joined_at: string
    nick: string
    pending: boolean
    premium_since: string
    roles: []
    user: IDiscordUser
    mute: boolean
    deaf: boolean
}