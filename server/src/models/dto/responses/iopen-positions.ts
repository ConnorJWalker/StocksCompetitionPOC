import IT212OpenPosition from '../../trading212/open-position'
import { Model } from 'sequelize'
import IUser, { IUserWithSecrets } from '../../iuser'

export default interface IOpenPositions {
    user: IUser,
    positions: {
        ticker: string
        quantity: number
        averagePrice: number
        currentPrice: number
        icon: string
    }[]
}

export const OpenPositionsFromApi = (user: IUserWithSecrets, openPositions: IT212OpenPosition[]): IOpenPositions => {
    return {
        user: {
            id: user.id,
            displayName: user.displayName,
            discordUsername: user.discordUsername,
            profilePicture: user.profilePicture,
            displayColour: user.displayColour
        },
        positions: openPositions.map(position => ({
            ticker: position.ticker,
            quantity: position.quantity,
            averagePrice: position.averagePrice,
            currentPrice: position.currentPrice,
            icon: process.env.T212_ICON_URL + position.ticker
        }))
    }
}

export const OpenPositionsFromDbResult = (openPosition: Model): IOpenPositions => {
    return {
        user: {
            id: openPosition.dataValues.id,
            displayName: openPosition.dataValues.displayName,
            discordUsername: openPosition.dataValues.discordUsername,
            profilePicture: openPosition.dataValues.profilePicture,
            displayColour: openPosition.dataValues.displayColour
        },
        positions: openPosition.dataValues.OpenPositions.map((position: Model) => ({
            ticker: position.dataValues.Instrument.ticker,
            quantity: position.dataValues.quantity,
            averagePrice: position.dataValues.averagePrice,
            currentPrice: position.dataValues.currentPrice,
            icons: process.env.T212_ICON_URL + position.dataValues.Instrument.t212Ticker
        }))
    }
}
