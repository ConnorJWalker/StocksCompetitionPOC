import { IPosition } from '../iopen-positions'

export default interface IOpenPositionsUpdates {
    new: IPosition[]
    updated: IPosition[]
    removed: IPosition[]
}