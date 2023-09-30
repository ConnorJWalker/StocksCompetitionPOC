import IUser, { UserFromDbResult } from '../iuser'
import IInstrument, { InstrumentFromDbResult } from '../iinstrument'
import { Model } from 'sequelize'

export default interface IOrderHistoryResponse {
    user: IUser
    order: {
        type: string
        price: number
        quantity: number
        date: string
        instrument: IInstrument
    }
}

export const OrderHistoryResponseFromDb = (value: Model): IOrderHistoryResponse => {
    return {
        user: UserFromDbResult(value.dataValues.User),
        order: {
            type: value.dataValues.type,
            price: value.dataValues.averagePrice,
            quantity: value.dataValues.quantity,
            date: value.dataValues.createdAt,
            instrument: InstrumentFromDbResult(value.dataValues.Instrument)
        }
    }
}
