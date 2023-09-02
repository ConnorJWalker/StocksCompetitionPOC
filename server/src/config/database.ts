import { Sequelize } from 'sequelize'
import UserSchema from './schemas/user'

const env = process.env

// @ts-ignore
const sequalize = new Sequelize(env.DATABASE_NAME, env.DATABASE_USERNAME, env.DATABASE_PASSWORD, {
    host: env.DATABASE_HOST,
    dialect: env.DATABASE_DIALECT
})

const user = sequalize.define('User', UserSchema);

(async () => {
    await sequalize.sync()
})()

export const User = user
