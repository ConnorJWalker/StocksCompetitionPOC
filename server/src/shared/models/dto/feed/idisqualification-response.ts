import IUser, { UserFromDbResult } from '../../iuser'
import { Model } from 'sequelize'

export default interface IDisqualificationResponse {
    user: IUser
    type: 'disqualification'
    content: {
        createdAt: string
    }
}

export const DisqualificationResponseFromDb = (value: Model) => ({
    user: UserFromDbResult(value.dataValues.User),
    type: 'disqualification',
    content: {
        // row created on user creation, last update is disqualification
        date: value.dataValues.updatedAt
    }
})
