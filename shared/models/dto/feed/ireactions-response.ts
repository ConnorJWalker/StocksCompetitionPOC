import { Model } from 'sequelize'

export default interface IReactionsResponse {
    likes: number
    dislikes: number
    userHasLiked: boolean
    userHasDisliked: boolean
}

export const ReactionsFromDbResult = (value: Model) => ({
    likes: value.dataValues.likes,
    dislikes: value.dataValues.dislikes,
    userHasLiked: value.dataValues.userHasLiked === 1,
    userHasDisliked: value.dataValues.userHasDisliked === 1
})
