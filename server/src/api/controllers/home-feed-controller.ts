import { Request, Response } from 'express'
import Redis from '../../shared/config/redis'
import DatabaseService from '../../shared/services/database-service'
import IAccountValueResponse from '../../shared/models/dto/iaccount-value-response'

const GetAccountValues = async (req: Request, res: Response) => {
    const cachedString = await Redis.get('t212-account-values')

    if (cachedString === null) {
        return res.json(await DatabaseService.GetAccountValues())
    }

    return res.json(JSON.parse(cachedString) as IAccountValueResponse)
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
