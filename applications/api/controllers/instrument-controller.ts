import { Request, Response } from 'express'
import DatabaseService from 'shared-server/services/database-service'

const SearchInstruments = async (req: Request, res: Response) => {
    if (!req.params.searchTerm) {
        return res.status(400).json({ error: 'Search term is required' })
    }

    const instruments = await DatabaseService.SearchInstruments(req.params.searchTerm)
    return res.status(200).json({ results: instruments })
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
