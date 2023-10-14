export default interface ILoginForm {
    discordUsername: string
    password: string
}

export const GetEmptyLoginForm = (): ILoginForm => {
    return {
        discordUsername: '',
        password: ''
    }
}
