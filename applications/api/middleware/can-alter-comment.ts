import { NextFunction, Response } from 'express'
import { RequestWithTargetUser } from './get-profile-user'
import DatabaseService from 'shared-server/services/database-service'

const CanAlterComment = async (req: RequestWithTargetUser, res: Response, next: NextFunction)=> {
    const comment = await DatabaseService.GetComment(parseInt(req.params.commentId))
    if (comment === null) {
        return res.status(404).json({})
    }

    if (comment.user.id !== req.authenticatedUser!.id) {
        return res.status(403).json({ error: 'Cannot edit other users comments' })
    }

    next()
}

export default CanAlterComment
