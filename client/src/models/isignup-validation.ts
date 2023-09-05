export default interface ISignupValidation {
    displayName: string[]
    discordUsername: string[]
    password: string[]
    confirmPassword: string[],
    apiKey: string[]
}

export const GetEmptySignupValidation = (): ISignupValidation => {
    return {
        displayName: [],
        discordUsername: [],
        password: [],
        confirmPassword: [],
        apiKey: []
    }
}
