import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    UserId: DataTypes.INTEGER,
    PostId: DataTypes.INTEGER,
    postType: DataTypes.STRING,
    type: DataTypes.INTEGER
}
