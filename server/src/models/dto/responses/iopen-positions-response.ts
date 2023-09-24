import IInstrument, { InstrumentFromDbResult } from '../../iinstrument'
import { Model } from 'sequelize'

export default interface IOpenPositionsResponse {
    quantity: number
    averagePrice: number
    instrument: IInstrument
}

export const OpenPositionsResponseFromDb = (values: Model[]): IOpenPositionsResponse[] => {
    return values.map(value => ({
        quantity: value.dataValues.quantity,
        averagePrice: value.dataValues.averagePrice,
        instrument: InstrumentFromDbResult(value.dataValues.Instrument)
    }))
}
