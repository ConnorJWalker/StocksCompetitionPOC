import { Model } from 'sequelize'

export default interface IInstrument {
    id: number
    type: string
    currencyCode: string
    name: string
    ticker: string
    icon: string
}

export const InstrumentFromDbResult = (value: Model): IInstrument => {
    return {
        id: value.dataValues.id,
        type: value.dataValues.type,
        currencyCode: value.dataValues.currencyCode,
        name: value.dataValues.name,
        ticker: value.dataValues.ticker,
        icon: process.env.T212_ICON_URL + value.dataValues.t212Ticker + '.png'
    }
}
