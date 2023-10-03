import IInstrument from '../../iintrument'

export default interface IOrder {
    type: string
    price: number
    quantity: number
    date: number
    instrument: IInstrument
}
