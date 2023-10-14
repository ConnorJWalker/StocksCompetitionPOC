export default interface IT212Exchange {
    id: number
    name: string
    workingSchedules: {
        id: number
        timeEvents: {
           date: string
           type: 'OPEN' | 'CLOSE' | 'PRE_MARKET_OPEN' | 'AFTER_HOURS_OPEN' | 'AFTER_HOURS_CLOSE'
        }[]
    }[]
}
