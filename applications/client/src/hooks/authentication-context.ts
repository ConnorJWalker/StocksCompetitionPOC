import { createContext, useContext } from 'react'
import IAuthenticationContext from '../models/iauthentication-context'

export const AuthenticationContext = createContext<IAuthenticationContext | null>(null)

const useAuthentication = (): IAuthenticationContext => {
    const authenticationContext =  useContext(AuthenticationContext)

    if (authenticationContext === null) {
        throw new Error('useAuthentication must be used with a AuthenticationContext')
    }

    return authenticationContext
}

export default useAuthentication
