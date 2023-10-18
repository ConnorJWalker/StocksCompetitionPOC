import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    PostId: DataTypes.INTEGER,
    postType: DataTypes.STRING,
    body: DataTypes.TEXT
}
