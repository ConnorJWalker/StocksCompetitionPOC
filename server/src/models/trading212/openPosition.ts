export default interface IT212OpenPosition {
    ticker: string
    quantity: number
    averagePrice: number
    currentPrice: number
    ppl: number
    fxPpl: number | null
    initialFillDate: string
    frontend: string
    maxBuy: number
    maxSell: number
    pieQuantity: number
}
