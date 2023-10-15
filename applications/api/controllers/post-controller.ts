import { Response } from 'express'
import { RequestWithTargetUser } from '../middleware/get-profile-user'
import DatabaseService from 'shared-server/services/database-service'

const validReactions = [0, 1]
const validPostTypes = ['order', 'disqualification']

const AddReaction = async (req: RequestWithTargetUser, res: Response) => {
    if (!req.params.type || !validReactions.includes(parseInt(req.params.type))) {
        return res.status(400).json({ error: 'invalid reaction type' })
    }

    if (!req.params.postType || !validPostTypes.includes(req.params.postType)) {
        return res.status(400).json({ error: 'invalid post type' })
    }

    if (!req.params.postId || isNaN(parseInt(req.params.postId))) {
        return res.status(400).json({ error: 'invalid post id' })
    }

    const postId = parseInt(req.params.postId)
    const reactionType = parseInt(req.params.type)

    if (!await DatabaseService.PostExists(postId, req.params.postType)) {
        return res.status(404).json({ error: 'post was not found' })
    }

    await DatabaseService.AddReaction(req.authenticatedUser!.id, parseInt(req.params.postId), req.params.postType, reactionType)
    return res.status(200).json({})
}

export default {
    AddReaction
}
