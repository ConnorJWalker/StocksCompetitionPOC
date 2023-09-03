import { Response } from 'express'
import Trading212Service from '../services/trading212-service'
import { RequestWithTargetUser } from '../middleware/get-profile-user'

const GetProfileStocks = async (req: RequestWithTargetUser, res: Response) => {
    const openPositions = await Trading212Service.GetOpenPositions(req.targetUser!.apiKey)
    return res.json(openPositions)
}

const GetProfileCash = async (req: RequestWithTargetUser, res: Response) => {
    const cash = await Trading212Service.GetCash(req.targetUser!.apiKey)
    return res.json(cash)
}

export default {
    GetProfileStocks,
    GetProfileCash
}
