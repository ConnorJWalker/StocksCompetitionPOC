import { Sequelize } from 'sequelize'
import UserSchema from './schemas/user'
import RefreshTokensSchema from './schemas/refresh-tokens'
import InstrumentSchema from './schemas/instrument'
import AccountValueSchema from './schemas/account-value'
import OpenPositionsSchema from './schemas/open-positions'
import OrderHistorySchema from './schemas/order-history'
import ApiKeySchema from './schemas/api-keys'
import DisqualificationsSchema from './schemas/disqualifications'
import * as fs from 'fs'

const env = process.env

// @ts-ignore
const sequalize = new Sequelize(env.DATABASE_NAME, env.DATABASE_USERNAME, env.DATABASE_PASSWORD, {
    host: env.DATABASE_HOST,
    dialect: env.DATABASE_DIALECT,
    dialectOptions: {
        multipleStatements: true
    },
    pool: {
        max: parseInt(process.env.DATABASE_MAX_CONNECTION_POOL || '45')
    }
})

const user = sequalize.define('User', UserSchema)
const refreshToken = sequalize.define('RefreshToken', RefreshTokensSchema)
const instrument = sequalize.define('Instrument', InstrumentSchema)
const accountValue = sequalize.define('AccountValue', AccountValueSchema)
const openPositions = sequalize.define('OpenPositions', OpenPositionsSchema)
const orderHistory = sequalize.define('OrderHistory', OrderHistorySchema)
const apiKey = sequalize.define('ApiKey', ApiKeySchema)
const disqualification = sequalize.define('Disqualification', DisqualificationsSchema)

user.hasMany(openPositions)
user.hasMany(accountValue)
user.hasMany(orderHistory)
user.hasOne(apiKey)
user.hasOne(disqualification)
openPositions.belongsTo(user)
openPositions.belongsTo(instrument)
orderHistory.belongsTo(user)
orderHistory.belongsTo(instrument)
apiKey.belongsTo(user)
disqualification.belongsTo(user)

// loading on startup so sync not a major issue
let unionSql = fs.readFileSync(`${__dirname}/sql/feed-union.sql`).toString()

;(async () => { await sequalize.sync() })()

export const Sequalize = sequalize
export const User = user
export const RefreshToken = refreshToken
export const Instrument = instrument
export const AccountValue = accountValue
export const OpenPositions = openPositions
export const OrderHistory = orderHistory
export const ApiKey = apiKey
export const Disqualification = disqualification

export const RawSql = {
    FeedUnion: unionSql
}
