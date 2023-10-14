import IAccountValueResponse from '../dto/feed/iaccount-value-response'
import IOpenPositionsResponse from '../dto/profile/iopen-positions-response'

export default interface IProfileData {
    isFollowing: boolean
    accountValue: {
        position: string
        value: IAccountValueResponse
    }
    openPositions: IOpenPositionsResponse[]
}
