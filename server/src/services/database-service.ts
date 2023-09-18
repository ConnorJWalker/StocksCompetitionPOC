import {
    AccountValue,
    Instrument,
    OpenPositions,
    OrderHistory,
    RefreshToken,
    Sequalize,
    User
} from '../config/database'
import IUser, { IUserWithSecrets, UserFromDbResult, UserWithSecretsFromDbResult } from '../models/iuser'
import ISignupForm from '../models/dto/isignup-form'
import IT212Instrument from '../models/trading212/instrument'
import { Optional } from 'sequelize'
import IAccountValue, { AccountValueFromDb } from '../models/dto/responses/iaccount-value'
import IOpenPositions, { IPosition, OpenPositionsFromDbResult } from '../models/dto/responses/iopen-positions'
import { IDbOrderHistory } from '../models/dto/responses/iorder-history'
import IRefreshToken, { RefreshTokenFromDbResult } from '../models/irefresh-token'

const instrumentIdFromTicker = (ticker: string) => Sequalize.literal(
    `(SELECT id FROM Instruments WHERE t212Ticker = ${Sequalize.escape(ticker)})`,
)

const CreateUser = async (signupForm: ISignupForm, hashedPassword: string): Promise<IUser> => {
    const user = await User.create({
        displayName: signupForm.displayName,
        discordUsername: signupForm.discordUsername,
        profilePicture: signupForm.profilePicture,
        displayColour: signupForm.displayColour,
        password: hashedPassword,
        apiKey: signupForm.apiKey
    })

    return UserFromDbResult(user)
}

const FindUserById = async (id: number): Promise<IUser | null> => {
    const user = await User.findByPk(id)
    return user === null ? null : UserFromDbResult(user)
}

const FindUserByUsername = async (username: string): Promise<IUser | null> => {
    const user = await User.findOne({ where: {
        discordUsername: username
    }})

    return user === null ? null : UserFromDbResult(user)
}

const FindUserByUsernameWithSecrets = async (username: string): Promise<IUserWithSecrets | null> => {
    const user = await User.findOne({ where: {
        discordUsername: username
    }})

    return user === null ? null : UserWithSecretsFromDbResult(user)
}

const GetAllUsersWithSecrets = async (): Promise<IUserWithSecrets[]> => {
    const users = await User.findAll()
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

const GetOpenPositions = async (userId: number | undefined = undefined): Promise<IOpenPositions[]> => {
    const openPositions = await User.findAll({
        attributes: {
            exclude: ['apiKey', 'password']
        },
        where: userId === undefined ? undefined : {
            id: userId
        },
        include: [{
            model: OpenPositions,
            required: true,
            include: [Instrument]
        }]
    })

    return openPositions.map(position => OpenPositionsFromDbResult(position))
}

const UpdateOpenPositions = async (user: IUser, newPositions: IPosition[], updatedPositions: IPosition[], removedPositions: IPosition[]): Promise<void> => {
    const created = OpenPositions.bulkCreate(newPositions.map(position => ({
        UserId: user.id,
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        InstrumentId: instrumentIdFromTicker(position.trading212Ticker)
    })))

    if (updatedPositions.length > 0) {
        let updateSql: string = ''
        updatedPositions.forEach(position => {
            updateSql += `UPDATE OpenPositions SET quantity = ${Sequalize.escape(position.quantity)}, updatedAt = NOW() `
                + `WHERE UserId = ${Sequalize.escape(user.id)} AND InstrumentId = ${Sequalize.escape(position.instrumentId!)};`
        })

        await Sequalize.query(updateSql)
    }

    const deleted = OpenPositions.destroy({
        where: {
            UserId: user.id,
            InstrumentId: removedPositions.map(removed => removed.instrumentId!)
        }
    })

    await Promise.all([created, deleted])
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

const GetAccountValue = async (userId: number): Promise<IAccountValue | null> => {
    const accountValue = await AccountValue.findOne({
        where: {
            UserId: userId
        },
        order: [['id', 'DESC']]
    })

    return accountValue === null ? null : AccountValueFromDb(accountValue)
}

export default {
    CreateUser,
    FindUserById,
    FindUserByUsername,
    FindUserByUsernameWithSecrets,
    GetAllUsersWithSecrets,
    GetRefreshToken,
    InvalidateRefreshTokenFamily,
    MarkRefreshTokenAsUsed,
    CreateRefreshToken,
    UpdateStocksList,
    AddAccountValues,
    GetOpenPositions,
    UpdateOpenPositions,
    AddOrders,
    GetAccountValue
}
