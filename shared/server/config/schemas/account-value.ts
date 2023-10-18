import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    cash: DataTypes.DECIMAL,
    invested: DataTypes.DECIMAL,
    gainLoss: DataTypes.DECIMAL(10, 2)
}
