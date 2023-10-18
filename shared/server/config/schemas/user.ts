import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    displayName: {
        allowNull: false,
        type: DataTypes.STRING(32)
    },
    discordUsername: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(32)
    },
    profilePicture: {
        allowNull: false,
        type: DataTypes.STRING
    },
    displayColour: {
        allowNull: false,
        type: DataTypes.STRING(7)
    },
    password: {
        allowNull: false,
        type: DataTypes.STRING
    },
    isAdmin: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
    }
}