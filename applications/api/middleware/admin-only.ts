import { NextFunction, Response } from 'express'
import { RequestWithTargetUser } from './get-profile-user'

const AdminOnly = (req: RequestWithTargetUser, res: Response, next: NextFunction) => {
    if (!req.authenticatedUser!.isAdmin) {
        return res.status(403).json({ error: 'admins only' })
    }

    next()
}

export default AdminOnly
