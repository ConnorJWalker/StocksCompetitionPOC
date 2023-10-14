import { Response } from 'express'
import FeedService from '../services/feed-service'
import { RequestWithTargetUser } from '../middleware/get-profile-user'

const GetAccountValues = async (req: RequestWithTargetUser, res: Response) => {
    return res.json(await FeedService.GetAccountValues(req!.authenticatedUser?.id))
}

const GetAccountValueGraph = async (req: RequestWithTargetUser, res: Response) => {
    const duration = (req.query.duration || 'day') as string

    return res.json(await FeedService.GetAccountGraph(duration, {
        for: 'following',
        userIdentifier: req.authenticatedUser!.id
    }))
}

const GetFeed = async (req: RequestWithTargetUser, res: Response) => {
    const page = req.query.page === undefined ? 0 : parseInt(req.query.page as string)
    return res.json(await FeedService.GetFeed(page, { for: 'following', userIdentifier: req.authenticatedUser!.id }))
}

export default {
    GetAccountValues,
    GetAccountValueGraph,
    GetFeed
}