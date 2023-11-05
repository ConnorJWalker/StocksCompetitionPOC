import DatabaseService from 'shared-server/services/database-service'
import Trading212Service from 'shared-server/services/trading212-service'
import IInstrument from 'client/src/models/iintrument'
import PolygonService from './polygon-service'
import ICompanyData from '../models/dto/company-data'

const SearchInstruments = async (searchTerm: string, page: number): Promise<IInstrument[]> => {
    let results: IInstrument[] = []

    // Make sure that exact matches are displayed as the first results
    if (page === 0) {
        results = await DatabaseService.SearchInstrumentsExact(searchTerm)
    }

    return [
        ...results,
        ...await DatabaseService.SearchInstrumentsExcludeExact(searchTerm, results.length, page)
    ]
}

const GetInstrumentChart = async (id: number, duration: string): Promise<number[] | null> => {
    const instrument = await DatabaseService.FindInstrumentById(id)
    if (instrument === null) return null

    if (instrument.t212Ticker.includes('_US_EQ')) {
        const chartData = await PolygonService.GetChart(instrument.ticker, duration)
        if (chartData.length > 0) {
            return chartData
        }
    }

    return await Trading212Service.GetChart(instrument.t212Ticker, duration)
}

const GetInstrumentData = async (id: number): Promise<ICompanyData | null> => {
    const instrument = await DatabaseService.FindInstrumentById(id)
    if (instrument === null) return null

    if (instrument.t212Ticker.includes('_US_EQ')) {
        const companyData = await PolygonService.GetCompanyData(instrument.ticker)
        if (companyData !== null) {
            return companyData
        }
    }

    return await Trading212Service.GetCompanyData(instrument.t212Ticker)
}

export default {
    SearchInstruments,
    GetInstrumentChart,
    GetInstrumentData
}
