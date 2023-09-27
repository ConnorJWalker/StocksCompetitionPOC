import { Response } from 'express'
import { RequestWithTargetUser } from '../middleware/get-profile-user'
import DatabaseService from '../services/database-service'
import Redis from '../config/redis'
import IAccountValueResponse from '../models/dto/responses/iaccount-value-response'

const GetUser = (req: RequestWithTargetUser, res: Response) => {
    return res.json({ ...req.targetUser, apiKey: undefined, password: undefined })
}

const GetOpenPositions = async (req: RequestWithTargetUser, res: Response) => {
    return res.json(await DatabaseService.GetOpenPositionsWithInstrument(req.targetUser!.id))
}

const GetAccountValue = async (req: RequestWithTargetUser, res: Response) => {
    const cached = await Redis.get('t212-account-values')
    let userValue: IAccountValueResponse | undefined

    if (cached !== null) {
        const parsed = JSON.parse(cached) as IAccountValueResponse[]
        userValue = parsed.find(value => value.user.discordUsername === req.targetUser?.discordUsername)
    }

    if (userValue === undefined) {
        const values = await DatabaseService.GetAccountValues(false, req.targetUser?.discordUsername)
        userValue = values.find(value => value.user.discordUsername === req.targetUser?.discordUsername)
    }

    return res.json(userValue || {})
}

const GetAccountValueGraph = async (req: RequestWithTargetUser, res: Response) => {
    return res.json(await DatabaseService.GetAccountValues(true, req.targetUser?.discordUsername))
}

const GetFeed = async (req: RequestWithTargetUser, res: Response) => {
    return res.json(await DatabaseService.GetOrderHistories(req.targetUser?.id))
}

export default {
    GetUser,
    GetOpenPositions,
    GetAccountValue,
    GetAccountValueGraph,
    GetFeed
}
