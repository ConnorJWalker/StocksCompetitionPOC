import IUser, { UserFromDbResult } from '../../iuser'
import { Model } from 'sequelize'

export default interface ICommentResponse {
    user: IUser
    id: number
    content: {
        body: string
        date: string
    }
}

export const CommentFromDbResult = (value: Model): ICommentResponse => ({
    user: UserFromDbResult(value.dataValues.User),
    id: value.dataValues.id,
    content: {
        body: value.dataValues.body,
        date: value.dataValues.createdAt
    }
})
