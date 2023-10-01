import {
    AccountValue,
    ApiKey,
    Instrument,
    OpenPositions,
    OrderHistory,
    RefreshToken,
    Sequalize,
    User
} from '../config/database'
import IUser, { IUserWithSecrets, UserFromDbResult, UserWithSecretsFromDbResult } from '../models/iuser'
import ISignupForm from '../../api/models/dto/isignup-form'
import IT212Instrument from '../models/trading212/instrument'
import { Op, Optional } from 'sequelize'
import IAccountValue from '../models/iaccount-value'
import IOpenPositions, { OpenPositionsFromDbResult } from '../models/iopen-positions'
import { IDbOrderHistory } from '../models/database/iorder-history'
import IRefreshToken, { RefreshTokenFromDbResult } from '../models/database/irefresh-token'
import IAccountValueResponse, { AccountValueResponseFromDb } from '../models/dto/iaccount-value-response'
import IOrderHistoryResponse, { OrderHistoryResponseFromDb } from '../models/dto/iorder-history-response'
import IOpenPositionsResponse, { OpenPositionsResponseFromDb } from '../models/dto/iopen-positions-response'
import IOpenPositionsUpdates from '../models/database/iopen-positions-updates'
import { Literal } from 'sequelize/types/utils'

const instrumentIdFromTicker = (ticker: string) => Sequalize.literal(
    `(SELECT id FROM Instruments WHERE t212Ticker = ${Sequalize.escape(ticker)})`
)

const CreateUser = async (signupForm: ISignupForm, hashedPassword: string): Promise<IUser> => {
    const user = await User.create({
        displayName: signupForm.displayName,
        discordUsername: signupForm.discordUsername,
        profilePicture: signupForm.profilePicture,
        displayColour: signupForm.displayColour,
        password: hashedPassword
    })

    const formattedUser = UserFromDbResult(user)

    await ApiKey.create({ UserId: formattedUser.id, apiKey: signupForm.apiKey })

    return formattedUser
}

const FindUserById = async (id: number): Promise<IUser | null> => {
    const user = await User.findByPk(id)
    return user === null ? null : UserFromDbResult(user)
}

const FindUserByUsername = async (username: string): Promise<IUser | null> => {
    const user = await User.findOne({
        where: {
            discordUsername: username
        }
    })

    return user === null ? null : UserFromDbResult(user)
}

const FindUserByUsernameWithSecrets = async (username: string): Promise<IUserWithSecrets | null> => {
    const user = await User.findOne({
        where: {
            discordUsername: username
        },
        include: {
            model: ApiKey,
            required: true
        }
    })

    return user === null ? null : UserWithSecretsFromDbResult(user)
}

const GetAllUsers = async (): Promise<IUser[]> => {
    const users = await User.findAll({
        attributes: {
            exclude: ['password']
        }
    })

    return users.map(user => UserFromDbResult(user))
}

const GetAllUsersWithValidApiKeys = async (): Promise<IUserWithSecrets[]> => {
    const users = await User.findAll({
        include: {
            model: ApiKey,
            required: true,
            where: {
                isValid: true
            }
        }
    })

    return users.map(user => UserWithSecretsFromDbResult(user))
}

const GetRefreshToken = async (token: string): Promise<IRefreshToken | null> => {
    const dbToken = await RefreshToken.findOne({ where: { token } })
    return dbToken === null ? null : RefreshTokenFromDbResult(dbToken)
}

const InvalidateRefreshTokenFamily = async (family: string): Promise<void> => {
    await RefreshToken.update({ invalid: true }, { where: { family } })
}

const MarkRefreshTokenAsUsed = async (id: number): Promise<void> => {
    await RefreshToken.update({ used: true }, { where: { id } })
}

const CreateRefreshToken = async (family: string, token: string): Promise<void> => {
    await RefreshToken.create({ family, token })
}

const UpdateStocksList = async (stocks: IT212Instrument[]): Promise<number> => {
    const t212Tickers = stocks.map<string>(stock => stock.ticker)
    const savedT212Tickers = await Instrument.findAll({
        attributes: ['t212Ticker'],
        where: {
            t212Ticker: t212Tickers
        }
    })

    const savedTickersSet = new Set<string>()
    savedT212Tickers.forEach(ticker => savedTickersSet.add(ticker.dataValues.t212Ticker))

    const toSave: Optional<any, string>[] = []
    stocks.forEach(stock => {
        if (!savedTickersSet.has(stock.ticker)) {
            toSave.push({
                type: stock.type,
                currencyCode: stock.currencyCode,
                name: stock.name,
                ticker: stock.shortName,
                t212Ticker: stock.ticker
            })
        }
    })

    await Instrument.bulkCreate(toSave)
    return toSave.length
}

const AddAccountValues = async (users: IUser[], accountValues: IAccountValue[]): Promise<void> => {
    await AccountValue.bulkCreate(accountValues.map((accountValue, index) => ({
        ...accountValue,
        UserId: users[index].id
    })))
}

const GetOpenPositions = async (userIds: number[]): Promise<IOpenPositions[]> => {
    const openPositions = await User.findAll({
        where: {
            id: userIds
        },
        attributes: {
            exclude: ['password']
        },
        include: [{
            model: OpenPositions,
            required: false,
            include: [Instrument]
        }]
    })

    return openPositions.map(position => OpenPositionsFromDbResult(position))
}

const GetOpenPositionsWithInstrument = async (userId: number): Promise<IOpenPositionsResponse[]> => {
    const openPositions = await OpenPositions.findAll({
        where: { userId },
        include: [{
            model: Instrument,
            required: true
        }]
    })

    return OpenPositionsResponseFromDb(openPositions)
}

const UpdateOpenPositions = async (openPositionsUpdates: { [key: number]: IOpenPositionsUpdates }): Promise<void> => {
    const toCreate: Optional<any, string>[] | { UserId: number; quantity: number; averagePrice: number; InstrumentId: Literal }[] = []
    const toDelete: any[] = []
    let toUpdate = ''
    const promises: Promise<any>[] = []

    Object.keys(openPositionsUpdates).forEach(key => {
        const userId = parseInt(key)

        openPositionsUpdates[userId].new.forEach(position => {
            toCreate.push({
                UserId: userId,
                quantity: position.quantity,
                averagePrice: position.averagePrice,
                InstrumentId: instrumentIdFromTicker(position.trading212Ticker)
            })
        })

        openPositionsUpdates[userId].removed.forEach(position => {
            toDelete.push({
                UserId: userId,
                InstrumentId: position.instrumentId
            })
        })

        openPositionsUpdates[userId].updated.forEach(position => {
            toUpdate += `UPDATE OpenPositions SET quantity = ${Sequalize.escape(position.quantity)}, updatedAt = NOW() `
                + `WHERE UserId = ${Sequalize.escape(userId)} AND InstrumentId = ${Sequalize.escape(position.instrumentId!)};`
        })
    })

    promises.push(OpenPositions.bulkCreate(toCreate))

    if (toDelete.length !== 0) {
        promises.push(OpenPositions.destroy({ where: { [Op.or]: toDelete }}))
    }

    if (toUpdate !== '') {
        promises.push(Sequalize.query(toUpdate))
    }

    await Promise.all(promises)
}

const AddOrders = async (orders: IDbOrderHistory[]): Promise<void> => {
    if (orders.length === 0) return

    await OrderHistory.bulkCreate(orders.map(order => ({
        type: order.type,
        averagePrice: order.averagePrice,
        quantity: order.quantity,
        UserId: order.userId,
        InstrumentId: instrumentIdFromTicker(order.trading212Ticker)
    })))
}

const GetOrderHistories = async (userId?: number): Promise<IOrderHistoryResponse[]> => {
    const values = await OrderHistory.findAll({
        where: userId === undefined ? undefined : {
            userId
        },
        include: [
            {
                model: User,
                required: true,
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt']
                }
            },
            {
                model: Instrument,
                required: true,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }
        ],
        order: [['id', 'DESC']]
    })

    return values.map(value => OrderHistoryResponseFromDb(value))
}

const GetAccountValues = async (getAll: boolean = false, discordUsername?: string): Promise<IAccountValueResponse[]> => {
    const values = await User.findAll({
        attributes: {
            exclude: ['password']
        },
        where: discordUsername === undefined ? undefined : {
            discordUsername
        },
        include: [{
            model: AccountValue,
            required: false,
            order: [['id', 'DESC']],
            limit: getAll ? undefined : 1
        }]
    })

    return AccountValueResponseFromDb(values, getAll)
}

const InvalidateApiKeys = async (userIds: number[]): Promise<void> => {
    await ApiKey.update({ isValid: false }, {
        where: {
            UserId: userIds
        }
    })
}

export default {
    CreateUser,
    FindUserById,
    FindUserByUsername,
    FindUserByUsernameWithSecrets,
    GetAllUsers,
    GetAllUsersWithValidApiKeys,
    GetRefreshToken,
    InvalidateRefreshTokenFamily,
    MarkRefreshTokenAsUsed,
    CreateRefreshToken,
    UpdateStocksList,
    AddAccountValues,
    GetOpenPositions,
    GetOpenPositionsWithInstrument,
    UpdateOpenPositions,
    AddOrders,
    GetOrderHistories,
    GetAccountValues,
    InvalidateApiKeys
}
