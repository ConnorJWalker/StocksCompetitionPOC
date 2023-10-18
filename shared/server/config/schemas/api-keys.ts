import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    isValid: DataTypes.BOOLEAN,
    apiKey: DataTypes.STRING
}
