import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    type: DataTypes.STRING,
    currencyCode: DataTypes.STRING,
    name: DataTypes.STRING,
    ticker: DataTypes.STRING,
    t212Ticker: DataTypes.STRING
}
