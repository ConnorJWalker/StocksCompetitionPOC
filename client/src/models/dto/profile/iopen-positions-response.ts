import IInstrument from '../../iintrument'

export default interface IOpenPositionsResponse {
    quantity: number
    averagePrice: number
    instrument: IInstrument
}
