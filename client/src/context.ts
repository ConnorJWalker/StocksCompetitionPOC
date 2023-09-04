import { createContext, useContext } from 'react'
import IUser from './models/iuser'

const UserContext = createContext<IUser | undefined>(undefined)

export const useUserContext = (): IUser => {
    const user = useContext(UserContext)

    if (user === null) {
        throw new Error('useUserContext must be used with a UserContext')
    }

    return user!
}

export default UserContext
