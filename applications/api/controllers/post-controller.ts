import { Response } from 'express'
import { RequestWithTargetUser } from '../middleware/get-profile-user'
import DatabaseService from 'shared-server/services/database-service'

const validReactions = [0, 1]
const validPostTypes = ['order', 'disqualification', 'comment']

const validatePostTypes = (req: RequestWithTargetUser, validateReactions: boolean = false): string | null => {
    if (!req.params.postType || !validPostTypes.includes(req.params.postType)) {
        return 'invalid post type'
    }

    if (!req.params.postId || isNaN(parseInt(req.params.postId))) {
        return 'invalid post id'
    }

    if (validateReactions && (!req.params.type || !validReactions.includes(parseInt(req.params.type)))) {
        return 'invalid reaction type'
    }

    return null
}

const AddReaction = async (req: RequestWithTargetUser, res: Response) => {
    let error = validatePostTypes(req, true)
    if (error !== null) {
        return res.status(400).json({ error: error })
    }

    const postId = parseInt(req.params.postId)
    const reactionType = parseInt(req.params.type)

    if (!await DatabaseService.PostExists(postId, req.params.postType)) {
        return res.status(404).json({ error: 'post was not found' })
    }

    await DatabaseService.AddReaction(req.authenticatedUser!.id, parseInt(req.params.postId), req.params.postType, reactionType)
    return res.status(200).json({})
}

const AddComment = async (req: RequestWithTargetUser, res: Response) => {
    let error = validatePostTypes(req, false)
    if (error !== null) {
        return res.status(400).json({ error })
    }

    if (!req.body.body || req.body.body.length < 3) {
        return res.status(400).json({ error: 'Body must be at least 3 characters long' })
    }

    if (req.body.body.length > 128) {
        return res.status(400).json({ error: 'Body must be less than 128 characters' })
    }

    const postId = parseInt(req.params.postId)
    if (!await DatabaseService.PostExists(postId, req.params.postType)) {
        return res.status(404).json({ error: 'post was not found' })
    }

    const commentId = await DatabaseService.AddComment(req.authenticatedUser!.id, postId, req.params.postType, req.body.body)
    return res.status(201).json({ id: commentId })
}

export default {
    AddReaction,
    AddComment
}
