import IT212OpenPosition from '../../trading212/openPosition'

export default interface IOpenPositions {
    ticker: string
    quantity: number
    averagePrice: number
    currentPrice: number
    icon: string
}

export const OpenPositionsFromApi = (openPositions: IT212OpenPosition): IOpenPositions => {
    return {
        ticker: openPositions.ticker,
        quantity: openPositions.quantity,
        averagePrice: openPositions.averagePrice,
        currentPrice: openPositions.currentPrice,
        icon: process.env.T212_ICON_URL + openPositions.ticker
    }
}
