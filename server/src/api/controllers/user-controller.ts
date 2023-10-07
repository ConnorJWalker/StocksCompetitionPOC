import { Response } from 'express'
import { RequestWithTargetUser } from '../middleware/get-profile-user'
import DatabaseService from '../../shared/services/database-service'

const Follow = async (req: RequestWithTargetUser, res: Response) => {
    if (req.targetUser!.id === req.authenticatedUser!.id) {
        return res.status(400).json({ error: 'You cannot follow yourself' })
    }

    await DatabaseService.ToggleUserFollow(req.authenticatedUser!.id, req.targetUser!.id)
    return res.status(200).json({})
}

const IsFollowing = async (req: RequestWithTargetUser, res:Response) => {
    if (req.targetUser!.id === req.authenticatedUser!.id) {
        return res.status(200).json({ isFollowing: false })
    }

    const isFollowing = await DatabaseService.IsUserFollowing(req.authenticatedUser!.id, req.targetUser!.id)
    return res.status(200).json({ isFollowing })
}

export default {
    Follow,
    IsFollowing
}