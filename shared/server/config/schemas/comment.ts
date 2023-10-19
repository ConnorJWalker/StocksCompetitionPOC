import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    PostId: DataTypes.INTEGER,
    postType: DataTypes.STRING,
    body: DataTypes.TEXT
}
