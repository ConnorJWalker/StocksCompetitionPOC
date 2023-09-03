export default interface IT212Instrument {
    ticker: string
    type: string
    workingScheduleId: number
    isin: string
    currencyCode: string
    name: string
    shortName: string
    minTradeQuantity: number
    maxOpenQuantity: number
    addedOn: string
}