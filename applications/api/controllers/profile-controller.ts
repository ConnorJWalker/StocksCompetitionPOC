import { Response } from 'express'
import { RequestWithTargetUser } from '../middleware/get-profile-user'
import DatabaseService from 'shared-server/services/database-service'
import FeedService from '../services/feed-service'

const GetUser = (req: RequestWithTargetUser, res: Response) => {
    return res.json({ ...req.targetUser, apiKey: undefined, password: undefined })
}

const GetOpenPositions = async (req: RequestWithTargetUser, res: Response) => {
    return res.json(await DatabaseService.GetOpenPositionsWithInstrument(req.targetUser!.id))
}

const GetAccountValueGraph = async (req: RequestWithTargetUser, res: Response) => {
    const duration = (req.query.duration || 'day') as string

    return res.json(await FeedService.GetAccountGraph(duration, {
        for: 'profile',
        userIdentifier: req.targetUser!.id
    }))
}

const GetFeed = async (req: RequestWithTargetUser, res: Response) => {
    const page = req.query.page === undefined ? 0 : parseInt(req.query.page as string)
    return res.json(await FeedService.GetFeed(page, { for: 'profile', userIdentifier: req.targetUser!.id }))
}

export default {
    GetUser,
    GetOpenPositions,
    GetAccountValueGraph,
    GetFeed
}
