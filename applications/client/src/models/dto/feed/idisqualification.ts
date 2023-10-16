import IReactions from './ireactions'
import IComment from './icomment'

export default interface IDisqualification {
    date: number
    reactions: IReactions
    comments: IComment[]
}