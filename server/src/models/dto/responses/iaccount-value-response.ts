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

export const AccountValueResponseFromRedis = (cached: string, users: IUser[]): IAccountValueResponse[] => {
    const values = JSON.parse(cached) as IAccountValue[]

    return users.map(user=> {
        const usersValue = values.find(value => value.discordUsername === user.discordUsername)

        return {
            user,
            values: usersValue === undefined
                ? defaultValue
                : { ...usersValue, discordUsername: undefined  }
        }
    })
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
