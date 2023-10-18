import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    type: DataTypes.STRING,
    averagePrice: DataTypes.DECIMAL,
    quantity: DataTypes.DECIMAL
}
