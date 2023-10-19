import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    strikes: DataTypes.INTEGER,
    disqualified: DataTypes.BOOLEAN,
}
