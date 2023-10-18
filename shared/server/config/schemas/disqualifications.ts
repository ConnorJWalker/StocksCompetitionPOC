import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    strikes: DataTypes.INTEGER,
    disqualified: DataTypes.BOOLEAN,
}
