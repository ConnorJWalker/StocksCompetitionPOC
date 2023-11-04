import { Request, Response } from 'express'
import DatabaseService from 'shared-server/services/database-service'
import InstrumentService from '../services/instrument-service'

const GetInstrument = async (req: Request, res: Response) => {
    const id = parseInt(req.params.instrumentId)
    const instrument = await DatabaseService.FindInstrumentById(id)

    return instrument === null
        ? res.status(404).json({})
        : res.status(200).json({ instrument })
}

const SearchInstruments = async (req: Request, res: Response) => {
    if (!req.params.searchTerm) {
        return res.status(400).json({ error: 'Search term is required' })
    }

    const results = await InstrumentService.SearchInstruments(req.params.searchTerm, parseInt((req.query.page || '0') as string))
    return res.status(200).json({ results: results })
}

const GetInstrumentChart = async (req: Request, res: Response) => {
    const validDurations = ['day', 'week', 'month', 'year', 'max']
    if (!req.query.duration || !validDurations.includes(req.query.duration as string)) {
        return res.status(400).json({ error: 'Invalid duration' })
    }

    const chart = await InstrumentService.GetInstrumentChart(parseInt(req.params.instrumentId))
    return chart === null
        ? res.status(404).json({})
        : res.status(200).json(chart)
}

const GetCompanyData = async (req: Request, res: Response) => {

}

const GetOwningUsers = async (req: Request, res: Response) => {
    const id = parseInt(req.params.instrumentId)
    if (await DatabaseService.FindInstrumentById(id) === null) {
        return res.status(404).json({})
    }

    const users = await DatabaseService.FindUsersHoldingInstrument(id)
    return res.status(200).json(users)
}

export default {
    GetInstrument,
    SearchInstruments,
    GetInstrumentChart,
    GetCompanyData,
    GetOwningUsers
}
