import IUser from '../../iuser'
import IReactions from './ireactions'

export default interface IComment {
    user: IUser
    id: number
    content: {
        body: string
        date: string
    }
    reactions: IReactions
}
