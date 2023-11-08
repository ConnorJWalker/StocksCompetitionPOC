export default interface ICompanyData {
    description: string
    keyFinancials: {
        marketCap?: number
        peRatio?: number
        revenue?: number
        eps?: number
        dividend?: number
        beta?: number
    }
}