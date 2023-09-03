import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    type: {
        allowNull: false,
        type: DataTypes.STRING(7)
    },
    currencyCode: {
        allowNull: false,
        type: DataTypes.STRING(3)
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    ticker: {
        allowNull: false,
        type: DataTypes.STRING
    },
    t212Ticker: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING
    }
}
