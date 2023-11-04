const url = 'https://api.polygon.io/v2/'
const key = process.env.POLYGON_KEY!

const timespanMultipliers: { [key: string]:  { multiplier: number, timespan: string }} = {
    day: {
       multiplier: 5,
        timespan: 'minute'
    },
    week: {
        multiplier: 30,
        timespan: 'minute'
    },
    month: {
        multiplier: 2,
        timespan: 'hour'
    },
    year: {
        multiplier: 1,
        timespan: 'day'
    },
    max: {
        multiplier: 1,
        timespan: 'week'
    }
}

const getChartStartAndEnd = (duration: string): [string, string] => {
    const now = new Date(Date.now())
    const start = new Date()

    // day duration has been ignored as same day twice will get day range
    if (duration === 'week') {
        start.setDate(start.getDate() - 7)
    }
    else if (duration === 'month') {
        start.setMonth(start.getMonth() - 1)
    }
    else if (duration === 'year' || duration === 'max') {
        start.setFullYear(start.getFullYear() - (duration === 'year' ? 1 : 4))
    }

    return [
        `${start.getFullYear()}-${start.getMonth()}-${start.getDate() < 10 ? 0 : ''}${start.getDate()}`,
        `${now.getFullYear()}-${now.getMonth()}-${now.getDate() < 10 ? 0 : ''}${now.getDate()}`
    ]
}

const GetChart = async (ticker: string, duration: string): Promise<number[]> => {
    const [start, end] = getChartStartAndEnd(duration)
    const { multiplier, timespan } = timespanMultipliers[duration]

    const endpoint = url + `aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${start}/${end}?`

    try {
        const response = await fetch(endpoint + new URLSearchParams({
            adjusted: 'true',
            sort: 'asc',
            apiKey: key
        }))

        if (response.ok) {
            const body = await response.json()
            return body.results.map((point: { c: number }) => point.c)
        }

        console.error((await response.json()).error)
    }
    catch (e) {
        console.error(e)
    }

    return []
}

export default {
    GetChart
}
