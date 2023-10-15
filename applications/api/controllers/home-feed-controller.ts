import { Request, Response } from 'express'
import FeedService from '../services/feed-service'
import { RequestWithTargetUser } from '../middleware/get-profile-user'

const GetAccountValues = async (req: Request, res: Response) => {
    return res.json(await FeedService.GetAccountValues())
}

const GetAccountValueGraph = async (req: Request, res: Response) => {
    const duration = (req.query.duration || 'day') as string

    return res.json(await FeedService.GetAccountGraph(duration))
}

const GetFeed = async (req: RequestWithTargetUser, res: Response) => {
    const page = req.query.page === undefined ? 0 : parseInt(req.query.page as string)
    return res.json(await FeedService.GetFeed(page, req.authenticatedUser!.id))
}

export default {
    GetAccountValues,
    GetAccountValueGraph,
    GetFeed
}
