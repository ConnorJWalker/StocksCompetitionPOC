import IUser from '../../iuser'
import IInstrument from '../../iintrument'

export default interface IOrderHistoryResponse {
    user: IUser
    order: {
        type: string
        price: number
        quantity: number
        date: number
        instrument: IInstrument
    }
}
