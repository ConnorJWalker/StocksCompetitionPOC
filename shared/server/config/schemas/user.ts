import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    displayName: DataTypes.STRING,
    discordUsername: DataTypes.STRING,
    profilePicture: DataTypes.STRING,
    displayColour: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN
}
