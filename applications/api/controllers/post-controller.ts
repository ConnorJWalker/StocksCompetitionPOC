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

const validateCommentBody = (body: string | undefined): string | null => {
    if (!body || body.length < 3) {
        return 'Body must be at least 3 characters long'
    }

    if (body.length > 128) {
        return 'Body must be less than 128 characters'
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

const GetComments = async (req: RequestWithTargetUser, res: Response) => {
    const skip = req.query['skip'] === undefined ? 0 : parseInt(req.query['skip'] as string)
    const comments = await DatabaseService.GetComments(parseInt(req.params.postId), req.params.postType, skip)

    return res.status(comments.length === 0 ? 204 : 200).json(comments)
}

const AddComment = async (req: RequestWithTargetUser, res: Response) => {
    let error = validatePostTypes(req, false)
    error = error === null ? validateCommentBody(req.body.body) : error
    if (error !== null) {
        return res.status(400).json({ error })
    }

    const postId = parseInt(req.params.postId)
    if (!await DatabaseService.PostExists(postId, req.params.postType)) {
        return res.status(404).json({ error: 'post was not found' })
    }

    const commentId = await DatabaseService.AddComment(req.authenticatedUser!.id, postId, req.params.postType, req.body.body)
    return res.status(201).json({ id: commentId })
}

const EditComment = async (req: RequestWithTargetUser, res: Response) => {
    const error = validateCommentBody(req.body.body)
    if (error !== null) {
        return res.status(400).json({ error })
    }

    await DatabaseService.EditComment(parseInt(req.params.commentId), req.body.body)
    return res.status(200).json({})
}

const DeleteComment = async (req: RequestWithTargetUser, res: Response) => {
    await DatabaseService.DeleteComment(parseInt(req.params.commentId))
    return res.status(200).json({})
}

export default {
    AddReaction,
    GetComments,
    AddComment,
    EditComment,
    DeleteComment
}
