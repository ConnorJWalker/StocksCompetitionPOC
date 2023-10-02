import { DataTypes } from 'sequelize'

export default {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    strikes: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    disqualified: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}
