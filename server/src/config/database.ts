import { Sequelize } from 'sequelize'
import UserSchema from './schemas/user'
import InstrumentSchema from './schemas/instrument'
import AccountValueSchema from './schemas/account-value'

const env = process.env

// @ts-ignore
const sequalize = new Sequelize(env.DATABASE_NAME, env.DATABASE_USERNAME, env.DATABASE_PASSWORD, {
    host: env.DATABASE_HOST,
    dialect: env.DATABASE_DIALECT
})

const user = sequalize.define('User', UserSchema)
const instrument = sequalize.define('Instrument', InstrumentSchema)
const accountValue = sequalize.define('AccountValue', AccountValueSchema)

;(async () => await sequalize.sync())()

export const User = user
export const Instrument = instrument
export const AccountValue = accountValue
