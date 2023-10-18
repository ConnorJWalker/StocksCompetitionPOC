import IUser, { UserFromDbResult } from '../../iuser'
import { Model } from 'sequelize'
import IReactionsResponse, { ReactionsFromDbResult } from './ireactions-response'
import ICommentResponse, { CommentFromDbResult } from './icomment-response'

export default interface IDisqualificationResponse {
    user: IUser
    type: 'disqualification'
    id: number
    content: {
        date: string
        reactions: IReactionsResponse
        comments: ICommentResponse[]
        commentCount: number
    }
}

export const DisqualificationResponseFromDb = (value: Model): IDisqualificationResponse => ({
    user: UserFromDbResult(value.dataValues.User),
    type: 'disqualification',
    id: value.dataValues.id,
    content: {
        // row created on user creation, last update is disqualification
        date: value.dataValues.updatedAt,
        reactions: ReactionsFromDbResult(value),
        comments: value.dataValues.Comments.map((comment: Model) => CommentFromDbResult(comment)),
        commentCount: value.dataValues.commentCount
    }
})
