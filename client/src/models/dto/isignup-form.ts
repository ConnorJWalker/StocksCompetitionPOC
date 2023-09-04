export default interface ISignupForm {
    displayName: string,
    discordUsername: string,
    profilePicture?: string,
    displayColour: string,
    password: string,
    passwordConfirm: string,
    apiKey: string
}

export const GetEmptySignupForm = () => {
    return {
        displayName: '',
        discordUsername: '',
        profilePicture: 'profile.png',
        displayColour: '#fff',
        password: '',
        passwordConfirm: '',
        apiKey: ''
    }
}
