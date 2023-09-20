import IT212AccountCash from './trading212/account-cash'
import { Model } from 'sequelize'

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

const ParseFloat = (input: string, decimalPlaces: number): number => {
    return Number(parseFloat(input).toFixed(decimalPlaces))
}

export const AccountValueFromDb = (accountValue: Model): IAccountValue => {
    const dataValues = accountValue.dataValues
    const cash = ParseFloat(dataValues.cash, 2)
    const invested = ParseFloat(dataValues.invested, 2)
    const gainLoss = ParseFloat(dataValues.gainLoss, 2)

    return {
        cash,
        invested,
        total: ParseFloat(`${cash + invested + gainLoss}`, 2),
        gainLoss
    }
}
