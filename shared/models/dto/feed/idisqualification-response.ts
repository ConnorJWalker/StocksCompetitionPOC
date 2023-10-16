import IUser, { UserFromDbResult } from '../../iuser'
import { Model } from 'sequelize'
import IReactionsResponse from './ireactions-response'
import ICommentResponse, { CommentFromDbResult } from './icomment-response'

export default interface IDisqualificationResponse {
    user: IUser
    type: 'disqualification'
    id: number
    content: {
        date: string
        reactions: IReactionsResponse
        comments: ICommentResponse[]
    }
}

export const DisqualificationResponseFromDb = (value: Model): IDisqualificationResponse => ({
    user: UserFromDbResult(value.dataValues.User),
    type: 'disqualification',
    id: value.dataValues.id,
    content: {
        // row created on user creation, last update is disqualification
        date: value.dataValues.updatedAt,
        reactions: {
            likes: value.dataValues.likes,
            dislikes: value.dataValues.dislikes,
            userHasLiked: value.dataValues.userHasLiked === 1,
            userHasDisliked: value.dataValues.userHasDisliked === 1
        },
        comments: value.dataValues.Comments.map((comment: Model) => CommentFromDbResult(comment))
    }
})
