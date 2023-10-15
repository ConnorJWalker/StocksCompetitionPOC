import IInstrument from '../../iintrument'
import IReactions from './ireactions'

export default interface IOrder {
    type: string
    price: number
    quantity: number
    date: number
    instrument: IInstrument
    reactions: IReactions
}
