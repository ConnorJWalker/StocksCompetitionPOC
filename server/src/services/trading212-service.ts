import IHttpResult, { FailureReason } from '../models/ihttp-result'

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
    ValidateApiKey
}