import IUser, { UserFromDbResult } from '../../iuser'
import IAccountValue, { AccountValueFromDb } from '../../iaccount-value'
import { Model } from 'sequelize'

export default interface IAccountValueResponse {
    user: IUser,
    values: IAccountValue | IAccountValue[]
}

const defaultValue = {
    cash: 0,
    invested: 0,
    total: 0,
    gainLoss: 0
}

export const AccountValueResponseFromT212 = (values: IAccountValue[], users: IUser[]): IAccountValueResponse[] => {
    return values.map((value, index) => ({
        user: {
            ...users[index],
            password: undefined,
            apiKey: undefined
        },
        values: value
    }))
}

export const AccountValueResponseFromDb = (values: Model[], isArray: boolean): IAccountValueResponse[] => {
    return values.map(value => {
        const accountValues = AccountValueFromDb(value.dataValues.AccountValues)

        return {
            user: UserFromDbResult(value),
            values: value.dataValues.AccountValues.length === 0
                ? defaultValue
                : isArray ? accountValues : accountValues[0]
        }
    })
}
