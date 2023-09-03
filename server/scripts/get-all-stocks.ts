import 'dotenv/config'
import DatabaseService from '../src/services/database-service'
import Trading212Service from '../src/services/trading212-service'

(async () => {
    if (process.env.HOST_DISCORD === undefined) {
        console.error('Host discord is not set in .env')
        return
    }

    const user = await DatabaseService.FindUserByUsernameWithSecrets(process.env.HOST_DISCORD)

    if (user === null) {
        console.error(`Could not find user ${process.env.HOST_DISCORD}`)
        return
    }

    try {
        const instruments = await Trading212Service.GetAllStocks(user.apiKey)
        const updateCount = await DatabaseService.UpdateStocksList(instruments)

        console.log(`Saved ${updateCount} new stocks to the database`)
    }
    catch (error: any) {
        console.error(error)
        return
    }
})()