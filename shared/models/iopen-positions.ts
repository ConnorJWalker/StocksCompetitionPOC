import IT212OpenPosition from './trading212/open-position'
import { Model } from 'sequelize'
import IUser from './iuser'

export interface IPosition {
    instrumentId?: number
    ticker: string
    trading212Ticker: string
    quantity: number
    averagePrice: number
    currentPrice?: number
    icon: string
}

export default interface IOpenPositions {
    user: IUser,
    positions: IPosition[]
}

/**
 * Converts list of open positions returned by trading212's api into a model to standardise between api
 * and database returned objects. The ticker field will always be an empty string due to it not being
 * returned by the trading212 api, however this data is only for internal use where this is not an issue
 *
 * @param {IUser} user The user that the stocks belong to
 * @param {IT212OpenPosition[]} openPositions List of open positions returned by the trading212 api
 * @returns {IOpenPositions} Reformatted object containing user details and list of their open positions
 */
export const OpenPositionsFromApi = (user: IUser, openPositions: IT212OpenPosition[]): IOpenPositions => {
    return {
        user: user,
        positions: openPositions.map(position => ({
            ticker: '',
            trading212Ticker: position.ticker,
            quantity: position.quantity,
            averagePrice: position.averagePrice,
            currentPrice: position.currentPrice,
            icon: process.env.T212_ICON_URL + position.ticker + '.png'
        }))
    }
}

/**
 * Converts list of open positions returned our database into a model to standardise between api
 * and database returned objects
 *
 * @param {Model} openPosition Database result object containing a user object, list of open positions
 * owned by the user and instrument information for each owned position
 * @returns {IOpenPositions} Reformatted object containing user details and list of their open positions
 */
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
            instrumentId: position.dataValues.Instrument.id,
            ticker: position.dataValues.Instrument.ticker,
            trading212Ticker: position.dataValues.Instrument.t212Ticker,
            quantity: parseFloat(position.dataValues.quantity),
            averagePrice: parseFloat(position.dataValues.averagePrice),
            icons: process.env.T212_ICON_URL + position.dataValues.Instrument.t212Ticker + '.png'
        }))
    }
}
