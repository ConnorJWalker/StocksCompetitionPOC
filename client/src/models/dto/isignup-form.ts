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
        profilePicture: '',
        displayColour: ((): string => {
            const availableCharacters = "0123456789abcdef"

            let colour = '#'
            for (let i = 0; i < 6; i++) {
                colour += availableCharacters[Math.floor(Math.random() * availableCharacters.length)]
            }

            return colour
        })(),
        password: '',
        passwordConfirm: '',
        apiKey: ''
    }
}
