import { DataTypes, STRING } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    UserId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    PostId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    postType: {
        allowNull: false,
        type: STRING(16)
    },
    type: {
        allowNull: false,
        type: DataTypes.INTEGER
    }
}
