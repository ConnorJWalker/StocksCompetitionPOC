import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    type: {
        allowNull: false,
        type: DataTypes.STRING(4)
    },
    averagePrice: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2)
    },
    quantity: {
        allowNull: false,
        type: DataTypes.DECIMAL(15, 5)
    }
}
