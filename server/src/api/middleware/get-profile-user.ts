import { Request, Response, NextFunction } from 'express'
import {IUserWithSecrets} from '../../shared/models/iuser'
import DatabaseService from '../../shared/services/database-service'

export interface RequestWithTargetUser extends Request {
    targetUser?: IUserWithSecrets
}

const FetchProfileUser = async (req: RequestWithTargetUser, res: Response, next: NextFunction) => {
    const user = await DatabaseService.FindUserByUsernameWithSecrets(req.params.discordUsername)
    if (user === null) {
        return res.status(404).send()
    }

    req.targetUser = user
    next()
}

export default FetchProfileUser
