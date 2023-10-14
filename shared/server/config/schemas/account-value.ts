import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    cash: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2)
    },
    invested: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2)
    },
    gainLoss: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2)
    }
}
