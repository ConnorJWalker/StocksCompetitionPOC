import IT212AccountCash from '../../trading212/account-cash'
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

export const AccountValueFromDb = (accountValue: Model): IAccountValue => {
    const dataValues = accountValue.dataValues

    return {
        cash: dataValues.cash,
        invested: dataValues.invested,
        total: dataValues.invested + dataValues.cash + dataValues.gainLoss,
        gainLoss: dataValues.gainLoss
    }
}
