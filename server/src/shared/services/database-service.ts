import {
    AccountValue,
    ApiKey,
    Disqualification,
    Instrument,
    OpenPositions,
    OrderHistory,
    RawSql,
    RefreshToken,
    Sequalize,
    User,
    Follower
} from '../config/database'
import IUser, { IUserWithSecrets, UserFromDbResult, UserWithSecretsFromDbResult } from '../models/iuser'
import ISignupForm from '../../api/models/dto/isignup-form'
import IT212Instrument from '../models/trading212/instrument'
import { Op, Optional, QueryTypes } from 'sequelize'
import IAccountValue from '../models/iaccount-value'
import IOpenPositions, { OpenPositionsFromDbResult } from '../models/iopen-positions'
import { IDbOrderHistory } from '../models/database/iorder-history'
import IRefreshToken, { RefreshTokenFromDbResult } from '../models/database/irefresh-token'
import IAccountValueResponse, {
    AccountValueResponseFromDb,
    AccountValueResponseFromRawSql
} from '../models/dto/iaccount-value-response'
import IOrderHistoryResponse, { OrderHistoryResponseFromDb } from '../models/dto/feed/iorder-history-response'
import IOpenPositionsResponse, { OpenPositionsResponseFromDb } from '../models/dto/iopen-positions-response'
import IOpenPositionsUpdates from '../models/database/iopen-positions-updates'
import { Literal } from 'sequelize/types/utils'
import IFeedUnion from '../models/database/ifeed-union'
import { DisqualificationResponseFromDb } from '../models/dto/feed/idisqualification-response'
import IFeedParams from '../models/database/ifeed-params'
import Redis from '../config/redis'

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
    await Disqualification.create({ UserId: formattedUser.id })

    await Redis.publish('user-update', '')

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

const UpdateDisplayName = async (userId: number, displayName: string) => {
    await User.update({ displayName }, {
        where: {
            id: userId
        }
    })

    await Redis.publish('user-update', '')
}

const UpdateDiscordProfilePicture = async (userId: number, discordProfilePicture: string) => {
    await User.update({ profilePicture: discordProfilePicture }, {
        where: {
            id: userId
        }
    })

    await Redis.publish('user-update', '')
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
        include: [
            {
                model: ApiKey,
                required: true,
                where: {
                    isValid: true
                }
            },
            {
                model: Disqualification,
                required: true,
                where: {
                    disqualified: false
                }
            }
        ]
    })

    return users.map(user => UserWithSecretsFromDbResult(user))
}

const SetApiKey = async (apiKey: string, userId: number) => {
    await ApiKey.update({
        isValid: true,
        apiKey
    }, {
        where: {
            UserId: userId
        }
    })

    await Redis.publish('user-update', '')
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

const GetOrders = async (orderIds: number[]): Promise<IOrderHistoryResponse[]> => {
    const orders = await OrderHistory.findAll({
        where: {
            id: orderIds
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
        ]
    })

    return orders.map(order => OrderHistoryResponseFromDb(order))
}

const GetCurrentAccountValues = async (userId?: number): Promise<IAccountValueResponse[]> => {
    const values = await User.findAll({
        attributes: {
            exclude: ['password']
        },
        where: userId === undefined ? undefined : {
            id: Sequalize.literal(`id IN (SELECT followingId FROM Followers WHERE followerId = ${Sequalize.escape(userId)}) OR id = ${Sequalize.escape(userId)}`)
        },
        include: [{
            model: AccountValue,
            required: false,
            order: [['id', 'DESC']],
            limit: 1
        }]
    })

    return AccountValueResponseFromDb(values, false)
}

const GetAccountValues = async (duration: string, params?: IFeedParams): Promise<IAccountValueResponse[]>  => {
    let startDate = new Date(Date.now())
    startDate.setHours(0, 0, 0)

    if (duration === 'week') {
        startDate.setDate(startDate.getDate() - 7)
    }

    let condition = 'true'
    if (params !== undefined) {
        const id = Sequalize.escape(params.userIdentifier)
        condition = params.for === 'profile'
            ? `id = ${id}`
            : `id IN (SELECT followingId FROM Followers WHERE followerId = ${id}) OR id = ${id}`
    }

    const sql = RawSql.GroupedAccountValues
        .replace(':condition', condition)
        .replace(':groupBy',  duration === 'day'
            ? 'AccountValues.id'
            : 'date_format(accountValuesCreatedAt, "%Y%m%d%H"), AccountValues.UserId'
        )

    const date = duration === 'max' ? new Date().setDate(0) : startDate
    const [result] = await Sequalize.query(sql, {
        replacements: { date }
    })

    return AccountValueResponseFromRawSql(result)
}

const InvalidateApiKeys = async (userIds: number[]): Promise<void> => {
    await ApiKey.update({ isValid: false }, {
        where: {
            UserId: userIds
        }
    })
}

const IncrementDisqualificationStrikes = async (userIds: number[]): Promise<void> => {
    const usersWithInvalidKeys = await ApiKey.findAll({
        where: {
            isValid: false
        }
    })

     await Disqualification.increment('strikes', {
        by: 1,
        where: {
            UserId: [
                ...userIds,
                ...usersWithInvalidKeys.map(user => user.dataValues.UserId)
            ]
        }
    })
}

const DisqualifyUsers = async (maxStrikes: number): Promise<string[]> => {
    const [count] = await Disqualification.update({ disqualified: true }, {
        where: {
            strikes: {
                [Op.gte]: maxStrikes
            }
        }
    })

    if (count === 0) return []

    const users = await User.findAll({
        include: [{
            model: Disqualification,
            required: true,
            where: {
                disqualified: true
            }
        }]
    })

    return users.map(user => user.dataValues.discordUsername)
}

const GetDisqualifiedUsers = async (userIds: number[]) => {
    const disqualifications = await Disqualification.findAll({
        where: {
            UserId: userIds
        },
        include: {
            model: User,
            required: true,
            attributes: {
                exclude: ['password']
            }
        }
    })

    return disqualifications.map(disqualification => DisqualificationResponseFromDb(disqualification))
}

const GetFeedIdUnion = async (limit: number, offset: number, params?: IFeedParams): Promise<IFeedUnion[]> => {
    let condition: boolean | string = true
    let sql = RawSql.FeedUnion

    if (params !== undefined) {
        const identifier = Sequalize.escape(params.userIdentifier)
        condition = params.for === 'profile'
            ? `UserId = ${identifier}`
            : `UserId IN (SELECT followingId FROM Followers WHERE followerId = ${identifier}) OR UserId = ${identifier}`

        sql = sql.replace(':condition', condition)
    }

    const [result, _] = await Sequalize.query(sql, {
        type: QueryTypes.RAW,
        replacements: { condition, limit, offset }
    })

    return result as IFeedUnion[]
}

const ToggleUserFollow = async (followerId: number, followingId: number): Promise<void> => {
    const followerRecord = await Follower.findOne({
        where: {
            followerId,
            followingId
        }
    })

    if (followerRecord === null) {
        await Follower.create({
            followerId,
            followingId
        })

        return
    }

    await followerRecord.destroy()
}

const IsUserFollowing = async (followerId: number, followingId: number): Promise<boolean> => {
    const isFollowing = await Follower.findOne({
        where: {
            followerId,
            followingId
        }
    })

    return isFollowing !== null
}

const GetFollowingList = async (usedId: number): Promise<IUser[]> => {
    const users = await User.findAll({
        attributes: {
            exclude: ['password']
        },
        include: {
            model: Follower,
            required: true,
            where: {
                followerId: usedId
            }
        }
    })

    return users.map(user => UserFromDbResult(user))
}

const UserApiKeyIsValid = async (userId: number): Promise<boolean> => {
    const user = await User.findOne({
        attributes: {
            exclude: ['password']
        },
        where: {
            id: userId
        },
        include: {
            model: ApiKey,
            required: true,
            where: {
                isValid: true
            }
        }
    })

    return user !== null
}

export default {
    CreateUser,
    FindUserById,
    FindUserByUsername,
    FindUserByUsernameWithSecrets,
    UpdateDisplayName,
    UpdateDiscordProfilePicture,
    GetAllUsers,
    GetAllUsersWithValidApiKeys,
    SetApiKey,
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
    GetOrders,
    GetCurrentAccountValues,
    GetAccountValues,
    InvalidateApiKeys,
    IncrementDisqualificationStrikes,
    DisqualifyUsers,
    GetDisqualifiedUsers,
    GetFeedIdUnion,
    ToggleUserFollow,
    IsUserFollowing,
    GetFollowingList,
    UserApiKeyIsValid
}
