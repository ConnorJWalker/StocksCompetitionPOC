import IT212AccountCash from './trading212/account-cash'
import { Model } from 'sequelize'
import ParseFloat from 'shared-server/utils/parse-float'

export default interface IAccountValue {
    discordUsername?: string
    cash: number
    invested: number
    total: number
    gainLoss: number
}

export const AccountValueFromApi = (accountValue: IT212AccountCash): IAccountValue => {
    return {
        cash: accountValue.free,
        invested: accountValue.invested,
        total: accountValue.total,
        gainLoss: accountValue.ppl
    }
}

export const AccountValueFromDb = (accountValues: Model[]): IAccountValue[] => {
    return accountValues.map(value => {
        const dataValues = value.dataValues
        const cash = ParseFloat(dataValues.cash, 2)
        const invested = ParseFloat(dataValues.invested, 2)
        const gainLoss = ParseFloat(dataValues.gainLoss, 2)

        return {
            cash,
            invested,
            total: ParseFloat(`${cash + invested + gainLoss}`, 2),
            gainLoss
        }
    })

}
