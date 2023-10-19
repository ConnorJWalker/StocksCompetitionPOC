import { createContext, useContext } from 'react'
import IUser from '../models/iuser'

interface IUserContext {
    user: IUser | null
    setUser: (newValue: IUser) => void
}

const UserContext = createContext<IUserContext>({
    user: null,
    setUser: () => {}
})

export const useUserContext = (): IUser => {
    const { user } = useContext(UserContext)

    if (user === null) {
        throw new Error('useUserContext must be used with a UserContext')
    }

    return user
}

export default UserContext
