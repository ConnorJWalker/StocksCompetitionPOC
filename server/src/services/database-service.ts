import { AccountValue, Instrument, OpenPositions, User } from '../config/database'
import IUser, {IUserWithSecrets, UserFromDbResult, UserWithSecretsFromDbResult} from '../models/iuser'
import ISignupForm from '../models/dto/isignup-form'
import IT212Instrument from '../models/trading212/instrument'
import { Optional } from 'sequelize'
import IAccountValue from '../models/dto/responses/iaccount-value'
import IOpenPositions, { OpenPositionsFromDbResult } from '../models/dto/responses/iopen-positions'

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

const FindUserById = async (id: number) => {
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
        userId: users[index].id
    })))
}

const GetOpenPositions = async (): Promise<IOpenPositions[]> => {
    const openPositions = await User.findAll({
        attributes: {
            exclude: ['apiKey', 'password']
        },
        include: [{
            model: OpenPositions,
            required: true,
            include: [Instrument]
        }]
    })

    return openPositions.map(position => OpenPositionsFromDbResult(position))
}

export default {
    CreateUser,
    FindUserById,
    FindUserByUsername,
    FindUserByUsernameWithSecrets,
    GetAllUsersWithSecrets,
    UpdateStocksList,
    AddAccountValues,
    GetOpenPositions
}
