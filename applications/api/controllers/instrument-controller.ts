import { Request, Response } from 'express'
import DatabaseService from 'shared-server/services/database-service'
import IInstrument from 'client/src/models/iintrument'

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

    results = [...results, ...await DatabaseService.SearchInstrumentsExcludeExact(searchTerm, results.length)]
    return res.status(200).json({ results: results })
}

const GetInstrumentChart = async (req: Request, res: Response) => {

}

const GetCompanyData = async (req: Request, res: Response) => {

}

const GetOwningUsers = async (req: Request, res: Response) => {

}

export default {
    SearchInstruments,
    GetInstrumentChart,
    GetCompanyData,
    GetOwningUsers
}
