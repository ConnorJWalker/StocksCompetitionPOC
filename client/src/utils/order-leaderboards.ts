import IAccountValueResponse from '../models/dto/feed/i-account-value-response'

const orderLeaderboards = (response: IAccountValueResponse[]): IAccountValueResponse[] => {
    return response.sort((a, b) => {
        if (a.values.total < b.values.total) return 1
        else if (a.values.total > b.values.total) return -1
        else return 0
    })
}

export default orderLeaderboards
