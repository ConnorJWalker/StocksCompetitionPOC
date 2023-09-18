import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    family: {
        allowNull: false,
        type: DataTypes.UUID
    },
    token: {
        allowNull: false,
        type: DataTypes.STRING(1024)
    },
    used: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
    },
    invalid: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
    }
}