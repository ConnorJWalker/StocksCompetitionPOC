import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    isValid: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    apiKey: {
        allowNull: false,
        type: DataTypes.STRING
    }
}
