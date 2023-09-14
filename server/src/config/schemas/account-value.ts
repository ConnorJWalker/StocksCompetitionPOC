import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
            model: 'Instruments',
            key: 'id'
        }
    },
    cash: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2)
    },
    invested: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2)
    }
}
