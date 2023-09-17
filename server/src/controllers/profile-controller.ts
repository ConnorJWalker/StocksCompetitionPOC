import { Response } from 'express'
import { RequestWithTargetUser } from '../middleware/get-profile-user'
import DatabaseService from '../services/database-service'
import Redis from '../config/redis'
import IAccountValue from '../models/dto/responses/iaccount-value'

const GetProfileStocks = async (req: RequestWithTargetUser, res: Response) => {
    const openPositions = await DatabaseService.GetOpenPositions(req.targetUser!.id)
    return openPositions.length === 1 ? res.json(openPositions[0]) : res.status(404).send()
}

const GetProfileCash = async (req: RequestWithTargetUser, res: Response) => {
    const cached = await Redis.get('t212-account-values')
    let userValue: IAccountValue | null

    if (cached === null) {
        userValue = await DatabaseService.GetAccountValue(req.targetUser!.id)
    }
    else {
        userValue = (JSON.parse(cached!) as IAccountValue[])
            .find(value => value.discordUsername === req.targetUser!.discordUsername) || null
    }

    return userValue === null ? res.status(404).send() : res.json(userValue)
}

export default {
    GetProfileStocks,
    GetProfileCash
}
