import IUser from '../../iuser'

export default interface IAccountValueResponse {
    user: IUser,
    values: IAccountValues
}

export interface IAccountValues {
    cash: number
    invested: number
    total: number
    gainLoss: number
}
