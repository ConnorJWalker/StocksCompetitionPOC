import { Request, Response } from 'express'
import DatabaseService from '../services/database-service'
import Trading212Service from '../services/trading212-service'

const GetProfileStocks = async (req: Request, res: Response) => {
    const user = await DatabaseService.FindUserByUsernameWithSecrets(req.params.discordUsername)

    if (user === null) {
        return res.status(404).send()
    }

    const openPositions = await Trading212Service.GetOpenPositions(user.apiKey)
    return res.json(openPositions)
}

const GetProfileCash = async (req: Request, res: Response) => {
    const user = await DatabaseService.FindUserByUsernameWithSecrets(req.params.discordUsername)

    if (user === null) {
        return res.status(404).send()
    }

    const cash = await Trading212Service.GetCash(user.apiKey)
    return res.json(cash)
}

export default {
    GetProfileStocks,
    GetProfileCash
}
