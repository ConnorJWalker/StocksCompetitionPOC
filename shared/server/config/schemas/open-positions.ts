import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: DataTypes.DECIMAL,
    averagePrice: DataTypes.DECIMAL
}
