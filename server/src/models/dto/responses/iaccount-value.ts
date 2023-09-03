import IT212AccountCash from '../../trading212/account-cash'

export default interface IAccountValue {
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
