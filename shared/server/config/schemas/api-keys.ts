import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    isValid: DataTypes.BOOLEAN,
    apiKey: DataTypes.STRING
}
