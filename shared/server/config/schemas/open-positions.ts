import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    quantity: DataTypes.DECIMAL,
    averagePrice: DataTypes.DECIMAL
}
