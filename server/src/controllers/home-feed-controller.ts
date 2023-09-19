import { Request, Response } from 'express'

const GetAccountValues = async (req: Request, res: Response) => {
    return res.send('Get Account Values')
}

const GetAccountValueGraph = async (req: Request, res: Response) => {
    return res.send('Get Account Values Graph')
}

const GetFeed = async (req: Request, res: Response) => {
    return res.send('Get Main Feed')
}

export default {
    GetAccountValues,
    GetAccountValueGraph,
    GetFeed
}
