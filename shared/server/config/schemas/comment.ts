import { DataTypes, STRING } from 'sequelize'

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
    postType: {
        allowNull: false,
        type: STRING(16)
    },
    body: {
        allowNull: false,
        type: DataTypes.TEXT
    }
}
