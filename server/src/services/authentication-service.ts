import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import ISignupForm from '../models/dto/isignup-form'
import { User } from '../config/database'

const CreateUser = async (signupForm: ISignupForm): Promise<string> => {
    const user = await User.create({
        displayName: signupForm.displayName,
        discordUsername: signupForm.discordUsername,
        profilePicture: signupForm.profilePicture,
        displayColour: signupForm.displayColour,
        password: await bcrypt.hash(signupForm.password, 10),
        apiKey: signupForm.apiKey
    })

    return createToken(user)
}

function createToken(user: any) {
    return jwt.sign({
        displayName: user.displayName,
        discordUsername: user.discordUsername,
        profilePicture: user.profilePicture,
        displayColour: user.displayColour
    }, process.env.JWT_SECRET as jwt.Secret)
}

export default {
    CreateUser
}
