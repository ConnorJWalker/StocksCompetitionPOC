import { User } from '../config/database'
import IUser, {IUserWithSecrets, UserFromDbResult, UserWithSecretsFromDbResult} from '../models/iuser'
import ISignupForm from '../models/dto/isignup-form'

const CreateUser = async (signupForm: ISignupForm, hashedPassword: string): Promise<IUser> => {
    const user = await User.create({
        displayName: signupForm.displayName,
        discordUsername: signupForm.discordUsername,
        profilePicture: signupForm.profilePicture,
        displayColour: signupForm.displayColour,
        password: hashedPassword,
        apiKey: signupForm.apiKey
    })

    return UserFromDbResult(user)
}

const FindUserById = async (id: number) => {
    const user = await User.findByPk(id)
    return user === null ? null : UserFromDbResult(user)
}

const FindUserByUsername = async (username: string): Promise<IUser | null> => {
    const user = await User.findOne({ where: {
        discordUsername: username
    }})

    return user === null ? null : UserFromDbResult(user)
}

const FindUserByUsernameWithSecrets = async (username: string): Promise<IUserWithSecrets | null> => {
    const user = await User.findOne({ where: {
        discordUsername: username
    }})

    return user === null ? null : UserWithSecretsFromDbResult(user)
}

export default {
    CreateUser,
    FindUserById,
    FindUserByUsername,
    FindUserByUsernameWithSecrets
}
