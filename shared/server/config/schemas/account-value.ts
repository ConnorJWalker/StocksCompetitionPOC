import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    cash: DataTypes.DECIMAL,
    invested: DataTypes.DECIMAL,
    gainLoss: DataTypes.DECIMAL(10, 2)
}
