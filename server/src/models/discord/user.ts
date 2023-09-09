export default interface IDiscordUser {
    id: number
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
