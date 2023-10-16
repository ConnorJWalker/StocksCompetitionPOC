import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    PostId: {
        allowNull: false,
        foreignKey: true,
        type: DataTypes.INTEGER
    },
    body: {
        allowNull: false,
        type: DataTypes.TEXT
    }
}
