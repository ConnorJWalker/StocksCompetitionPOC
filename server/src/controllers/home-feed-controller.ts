import { Request, Response } from 'express'
import Redis from '../config/redis'
import DatabaseService from '../services/database-service'
import IAccountValue from '../models/iaccount-value'
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
    return res.send('Get Account Values Graph')
}

const GetFeed = async (req: Request, res: Response) => {
    return res.send('Get Main Feed')
}

export default {
    GetAccountValues,
    GetAccountValueGraph,
    GetFeed
}
