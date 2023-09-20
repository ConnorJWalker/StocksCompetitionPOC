import IHttpResult, { FailureReason } from '../models/ihttp-result'
import IT212OpenPosition from '../models/trading212/open-position'
import IOpenPositions, { OpenPositionsFromApi } from '../models/dto/responses/iopen-positions'
import IAccountValue, { AccountValueFromApi } from '../models/iaccount-value'
import IT212AccountCash from '../models/trading212/account-cash'
import IT212Instrument from '../models/trading212/instrument'
import Redis from '../config/redis'
import { IUserWithSecrets } from '../models/iuser'

const failureCodes: { [key: number]: FailureReason } = {
    401: FailureReason.Unauthorised,
    403: FailureReason.MissingScope,
    429: FailureReason.RateLimitExceeded
}

const getFailureCode = (code: number): FailureReason =>  failureCodes[code] === undefined ? FailureReason.Other : failureCodes[code]

const ValidateApiKey = async (apiKey: string): Promise<[boolean, FailureReason?]> => {
    const cacheKey = `t212-keys:${apiKey}`
    const cachedValue = await Redis.get(cacheKey)

    if (cachedValue !== null) {
        if (cachedValue === 'valid') return [true, undefined]

        return [false, getFailureCode(parseInt(cachedValue))]
    }

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
            const reason = getFailureCode(results[i].statusCode)
            await Redis.setEx(cacheKey, 600, results[i].statusCode.toString())

            return [false, reason]
        }
    }

    await Redis.setEx(cacheKey, 600, 'valid')
    return [true, undefined]
}

const GetOpenPositions = async (user: IUserWithSecrets): Promise<IOpenPositions> => {
    const result = await send<IT212OpenPosition[]>('equity/portfolio', user.apiKey)
    if (result.ok) {
        return OpenPositionsFromApi(user, result.content!)
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