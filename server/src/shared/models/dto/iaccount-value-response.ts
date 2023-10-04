import IUser, { UserFromDbResult } from '../iuser'
import IAccountValue, { AccountValueFromDb } from '../iaccount-value'
import { Model } from 'sequelize'
import ParseFloat from '../../utils/parse-float'

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
                ? isArray ? [defaultValue] : defaultValue
                : isArray ? accountValues : accountValues[0]
        }
    })
}

export const AccountValueResponseFromRawSql = (values: any): IAccountValueResponse[] => {
    const usersDict: { [key: number]: IAccountValueResponse } = {}
    values.forEach((value: any) => {
        if (!usersDict[value.id]) {
            usersDict[value.id] = {
                user: {
                    id: value.id,
                    displayName: value.displayName,
                    discordUsername: value.discordUsername,
                    profilePicture: value.profilePicture,
                    displayColour: value.displayColour
                },
                values: []
            }
        }

        const cash = ParseFloat(value.accountValuesCash, 2)
        const invested = ParseFloat(value.accountValuesInvested, 2)
        const gainLoss = ParseFloat(value.accountValuesGainLoss, 2)

        ;(usersDict[value.id].values as IAccountValue[]).push({
            cash,
            invested,
            gainLoss,
            total: ParseFloat(`${cash + invested + gainLoss}`, 2)
        })
    })

    return Object.values(usersDict).map(value => value)
}
