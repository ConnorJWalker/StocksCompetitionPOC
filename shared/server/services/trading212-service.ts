import IHttpResult, { FailureReason } from 'shared-models/ihttp-result'
import IT212OpenPosition from 'shared-models/trading212/open-position'
import IOpenPositions, { OpenPositionsFromApi } from 'shared-models/iopen-positions'
import IAccountValue, { AccountValueFromApi } from 'shared-models/iaccount-value'
import IT212AccountCash from 'shared-models/trading212/account-cash'
import IT212Instrument from 'shared-models/trading212/instrument'
import Redis from '../config/redis'
import { IUserWithSecrets } from 'shared-models/iuser'
import IT212Exchange from 'shared-models/trading212/exchange'

const failureCodes: { [key: number]: FailureReason } = {
    401: FailureReason.Unauthorised,
    403: FailureReason.MissingScope,
    429: FailureReason.RateLimitExceeded
}

const durations: { [key: string]: { size: number, period: string }} = {
    day: {
        size: 288,
        period: 'FIVE_MINUTES'
    },
    week: {
        size: 336,
        period: 'THIRTY_MINUTES'
    },
    month: {
        size: 187,
        period: 'FOUR_HOURS'
    },
    year: {
        size: 365,
        period: 'ONE_DAY'
    },
    max: {
        size: 500,
        period: 'ONE_WEEK'
    }
}

const getFailureCode = (code: number): FailureReason =>  failureCodes[code] === undefined ? FailureReason.Other : failureCodes[code]

export class Trading212Error extends Error {
    public reason: FailureReason

    constructor(message: string, reason: FailureReason) {
        super(message)
        this.reason = reason
    }
}

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

    throw new Trading212Error(`Could not fetch open positions: ${result.statusCode}`, getFailureCode(result.statusCode))
}

const GetCash = async (apiKey: string): Promise<IAccountValue> => {
    const result = await send<IT212AccountCash>('equity/account/cash', apiKey)
    if (result.ok) {
        return AccountValueFromApi(result.content!)
    }

    throw new Trading212Error(`Could not fetch cash: ${result.statusCode}`, getFailureCode(result.statusCode))
}

const GetAllStocks = async (apiKey: string): Promise<IT212Instrument[]> => {
    const result = await send<IT212Instrument[]>('equity/metadata/instruments', apiKey)
    if (result.ok) {
        return result.content!
    }

    throw new Trading212Error(`Could not fetch all stocks: ${result.statusCode}`, getFailureCode(result.statusCode))
}

const GetExchangeList = async (apiKey: string): Promise<IT212Exchange[]> => {
    const result = await send<IT212Exchange[]>('equity/metadata/exchanges', apiKey)
    if (result.ok) {
        return result.content!
    }

    throw new Trading212Error(`Could not fetch exchange list: ${result.statusCode}`, getFailureCode(result.statusCode))
}

const GetChart = async (ticker: string, duration: string): Promise<number[]> => {
    const { size, period } = durations[duration]

    try {
        const response = await fetch(process.env.T212_ALT_URL + 'charting/v3/candles/close', {
            method: 'put',
            body: JSON.stringify({
                candles: [{
                    period,
                    size,
                    ticker,
                    useAskPrice: true
                }]
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (response.ok) {
            const body = await response.json()
            return body[0].response['candles'].map((candle: number[]) => candle[1])
        }

        console.error(await response.text())
    }
    catch (e) {
        console.error(e)
    }

    return []
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
    GetAllStocks,
    GetExchangeList,
    GetChart
}