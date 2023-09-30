export default interface IDiscordUser {
    id: bigint
    username: string
    avatar: string
    discriminator: number
    public_flags: number
    flags: number
    banner: string
    accent_color: string
    global_name: string
    avatar_decoration_data: string
    banner_color: string
}

export const DiscordUserFromCache = (cachedUser: { [key: string]: string }): IDiscordUser => {
    return {
        id: BigInt(cachedUser['id']),
        username: cachedUser['username'],
        avatar: cachedUser['avatar'],
        discriminator: parseInt(cachedUser['discriminator']),
        public_flags: parseInt(cachedUser['public_flags']),
        flags: parseInt(cachedUser['flags']),
        banner: cachedUser['banner'],
        accent_color: cachedUser['accent_color'],
        global_name: cachedUser['global_name'],
        avatar_decoration_data: cachedUser['avatar_decoration_data'],
        banner_color: cachedUser['banner_color']
    }
}

export const DiscordUserToCache = (user: IDiscordUser) => {
    const returnData: { [key: string]: string } = {}

    for (let [key, value] of Object.entries(user)) {
        value = value || ''
        returnData[key] = value.toString()
    }

    return returnData
}
