import { DataTypes } from 'sequelize'

export default {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    family: DataTypes.UUID,
    token: DataTypes.STRING,
    used: DataTypes.BOOLEAN,
    invalid: DataTypes.BOOLEAN
}
