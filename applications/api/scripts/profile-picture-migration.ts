import 'dotenv/config'
import DatabaseService from 'shared-server/services/database-service'
import DiscordService from 'shared-server/services/discord-service'

(async () => {
    const users = await DatabaseService.GetAllUsers()

    for (let i = 0; i < users.length; i++) {
        const newUrl = await DiscordService.GetProfilePicture(users[i].discordUsername)
        await DatabaseService.UpdateDiscordProfilePicture(users[i].id, newUrl)
    }
})()
