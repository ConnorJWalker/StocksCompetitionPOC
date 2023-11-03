import { Request, Response } from 'express'
import DatabaseService from 'shared-server/services/database-service'
import IInstrument from 'client/src/models/iintrument'

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

    const searchTerm = req.params.searchTerm
    const page = req.query.page === undefined ? 0 : parseInt(req.query.page as string)
    let results: IInstrument[] = []

    // Make sure that exact matches are displayed as the first results
    if (page === 0) {
        results = await DatabaseService.SearchInstrumentsExact(searchTerm)
    }

    results = [...results, ...await DatabaseService.SearchInstrumentsExcludeExact(searchTerm, results.length, page)]
    return res.status(200).json({ results: results })
}

const GetInstrumentChart = async (req: Request, res: Response) => {

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
