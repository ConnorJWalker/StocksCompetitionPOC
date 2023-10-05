import { Request, Response } from 'express'
import DatabaseService from '../../shared/services/database-service'
import FeedService from '../services/feed-service'

const GetAccountValues = async (req: Request, res: Response) => {
    return res.json(await FeedService.GetAccountValues())
}

const GetAccountValueGraph = async (req: Request, res: Response) => {
    const duration = (req.query.duration || 'day') as string

    return res.json(await DatabaseService.GetAccountValues(duration))
}

const GetFeed = async (req: Request, res: Response) => {
    const page = req.query.page === undefined ? 0 : parseInt(req.query.page as string)
    return res.json(await FeedService.GetFeed(page))
}

export default {
    GetAccountValues,
    GetAccountValueGraph,
    GetFeed
}
