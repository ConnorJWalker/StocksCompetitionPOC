import { Request, Response } from 'express'
import DatabaseService from '../services/database-service'
import Trading212Service from '../services/trading212-service'

const GetProfileStocks = async (req: Request, res: Response) => {
    const user = await DatabaseService.FindUserByUsernameWithSecrets(req.params.discordUsername)

    if (user === null) {
        return res.status(404)
    }

    const openPositions = await Trading212Service.GetOpenPositions(user.apiKey)

    return res.json(openPositions)
}

export default {
    GetProfileStocks
}
