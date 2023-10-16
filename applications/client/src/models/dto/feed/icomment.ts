import IUser from '../../iuser'

export default interface IComment {
    user: IUser
    id: number
    content: {
        body: string
        date: string
    }
}
