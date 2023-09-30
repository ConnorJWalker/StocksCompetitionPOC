import { Model } from 'sequelize'

export default interface IRefreshToken {
    id: number
    family: string
    token: string
    used: boolean
    invalid: boolean
}

export const RefreshTokenFromDbResult = (token: Model): IRefreshToken => {
    return {
        id: token.dataValues.id,
        family: token.dataValues.family,
        token: token.dataValues.token,
        used: token.dataValues.used,
        invalid: token.dataValues.invalid
    }
}
