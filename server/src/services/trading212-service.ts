import IHttpResult, { FailureReason } from '../models/ihttp-result'
import IT212OpenPosition from '../models/trading212/open-position'
import IOpenPositions, { OpenPositionsFromApi } from '../models/dto/responses/iopen-positions'
import IAccountValue, {AccountValueFromApi} from '../models/dto/responses/iaccount-value'
import IT212AccountCash from '../models/trading212/account-cash'
import IT212Instrument from '../models/trading212/instrument'

const ValidateApiKey = async (apiKey: string): Promise<[boolean, FailureReason?]> => {
    const results = await Promise.all([
        send('equity/account/cash', apiKey),
        send('history/dividends', apiKey),
        // TODO: these endpoints always seems to return error 500, uncomment when fixed
        // send('equity/history/orders', apiKey),
        // send('history/transactions', apiKey),
        send('equity/metadata/exchanges', apiKey),
        send('equity/orders', apiKey)
    ])

    for (let i = 0; i < results.length; i++) {
        if (!results[i].ok) {
            let reason: FailureReason
            switch (results[i].statusCode) {
                case 401:
                    reason = FailureReason.Unauthorised
                    break
                case 403:
                    reason = FailureReason.MissingScope
                    break
                case 429:
                    reason = FailureReason.RateLimitExceeded
                    break
                default: reason = FailureReason.Other
            }

            return [false, reason]
        }
    }

    return [true, undefined]
}

const GetOpenPositions = async (apiKey: string): Promise<IOpenPositions[]> => {
    const result = await send<IT212OpenPosition[]>('equity/portfolio', apiKey)
    if (result.ok) {
        return result.content!.map(position => OpenPositionsFromApi(position))
    }

    throw new Error(`Could not fetch open positions: ${result.statusCode}`)
}

const GetCash = async (apiKey: string): Promise<IAccountValue> => {
    const result = await send<IT212AccountCash>('equity/account/cash', apiKey)
    if (result.ok) {
        return AccountValueFromApi(result.content!)
    }

    throw new Error(`Could not fetch cash: ${result.statusCode}`)
}

const GetAllStocks = async (apiKey: string): Promise<IT212Instrument[]> => {
    const result = await send<IT212Instrument[]>('equity/metadata/instruments', apiKey)
    if (result.ok) {
        return result.content!
    }

    throw new Error(`Could not fetch all stocks: ${result.statusCode}`)
}

const send = async <T>(endpoint: string, apiKey: string, method: string = 'get'): Promise<IHttpResult<T | null>> => {
    const response = await fetch(`${process.env.T212_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: apiKey
        }
    })

    return {
        ok: response.ok,
        statusCode: response.status,
        content: response.ok ? await response.json() as T : null
    }
}

export default {
    ValidateApiKey,
    GetOpenPositions,
    GetCash,
    GetAllStocks
}