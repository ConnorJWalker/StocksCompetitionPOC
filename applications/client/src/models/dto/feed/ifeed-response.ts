import IUser from '../../iuser'
import IOrder from './iorder'
import IDisqualification from './idisqualification'

export default interface IFeedResponse {
    user: IUser
    type: 'order' | 'disqualification'
    id: number
    content: IOrder | IDisqualification
}
