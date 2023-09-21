import { Request, Response } from 'express'
import Redis from '../config/redis'
import DatabaseService from '../services/database-service'
import { AccountValueResponseFromRedis } from '../models/dto/responses/iaccount-value-response'

const GetAccountValues = async (req: Request, res: Response) => {
    const cachedString = await Redis.get('t212-account-values')

    if (cachedString === null) {
        return res.json(await DatabaseService.GetAccountValues())
    }

    const users = await DatabaseService.GetAllUsers()
    return res.json(AccountValueResponseFromRedis(cachedString, users))
}

const GetAccountValueGraph = async (req: Request, res: Response) => {
    // TODO: add day, week and month return
    const duration = (req.query.duration || 'day') as string

    return res.json(await DatabaseService.GetAccountValues(true))
}

const GetFeed = async (req: Request, res: Response) => {
    return res.json(await DatabaseService.GetOrderHistories())
}

export default {
    GetAccountValues,
    GetAccountValueGraph,
    GetFeed
}
