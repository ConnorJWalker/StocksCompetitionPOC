import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    quantity: {
        allowNull: false,
        type: DataTypes.DECIMAL(15, 5)
    },
    averagePrice: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2)
    }
}