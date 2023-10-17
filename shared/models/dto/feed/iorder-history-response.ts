import IUser, { UserFromDbResult } from '../../iuser'
import IInstrument, { InstrumentFromDbResult } from '../../iinstrument'
import { Model } from 'sequelize'
import IReactionsResponse from './ireactions-response'
import ICommentResponse, { CommentFromDbResult } from './icomment-response'

export default interface IOrderHistoryResponse {
    user: IUser
    type: 'order'
    id: number
    content: {
        type: string
        price: number
        quantity: number
        date: string
        instrument: IInstrument
        reactions: IReactionsResponse
        comments: ICommentResponse[]
        commentCount: number
    }
}

export const OrderHistoryResponseFromDb = (value: Model): IOrderHistoryResponse => {
    return {
        user: UserFromDbResult(value.dataValues.User),
        type: 'order',
        id: value.dataValues.id,
        content: {
            type: value.dataValues.type,
            price: value.dataValues.averagePrice,
            quantity: value.dataValues.quantity,
            date: value.dataValues.createdAt,
            instrument: InstrumentFromDbResult(value.dataValues.Instrument),
            reactions: {
                likes: value.dataValues.likes,
                dislikes: value.dataValues.dislikes,
                userHasLiked: value.dataValues.userHasLiked === 1,
                userHasDisliked: value.dataValues.userHasDisliked === 1
            },
            comments: value.dataValues.Comments.map((comment: Model) => CommentFromDbResult(comment)),
            commentCount: value.dataValues.commentCount
        }
    }
}
