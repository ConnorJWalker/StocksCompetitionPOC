import { Model } from 'sequelize'

export default interface IUser {
    id: number
    displayName: string
    discordUsername: string
    profilePicture: string
    displayColour: string
}

export interface IUserWithSecrets extends IUser {
    password: string
    apiKey: string
    isAdmin: boolean
}

export const UserFromDbResult = (user: Model): IUser => {
    return {
        id: user.dataValues.id,
        displayName: user.dataValues.displayName,
        discordUsername: user.dataValues.discordUsername,
        profilePicture: user.dataValues.profilePicture,
        displayColour: user.dataValues.displayColour,
    }
}

export const UserWithSecretsFromDbResult = (user: Model): IUserWithSecrets => {
    return {
        ...UserFromDbResult(user),
        password: user.dataValues.password,
        apiKey: user.dataValues.ApiKey.dataValues.apiKey,
        isAdmin: user.dataValues.isAdmin
    }
}
