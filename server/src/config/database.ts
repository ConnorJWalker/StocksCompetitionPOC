import { Sequelize } from 'sequelize'
import UserSchema from './schemas/user'
import InstrumentSchema from './schemas/instrument'
import AccountValueSchema from './schemas/account-value'
import OpenPositionsSchema from './schemas/open-positions'
import OrderHistorySchema from './schemas/order-history'

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
const instrument = sequalize.define('Instrument', InstrumentSchema)
const accountValue = sequalize.define('AccountValue', AccountValueSchema)
const openPositions = sequalize.define('OpenPositions', OpenPositionsSchema)
const orderHistory = sequalize.define('OrderHistory', OrderHistorySchema)

user.hasMany(openPositions)
user.hasMany(accountValue)
user.hasMany(orderHistory)
openPositions.belongsTo(user)
openPositions.belongsTo(instrument)
orderHistory.belongsTo(user)
orderHistory.belongsTo(instrument)

;(async () => await sequalize.sync())()

export const Sequalize = sequalize
export const User = user
export const Instrument = instrument
export const AccountValue = accountValue
export const OpenPositions = openPositions
export const OrderHistory = orderHistory