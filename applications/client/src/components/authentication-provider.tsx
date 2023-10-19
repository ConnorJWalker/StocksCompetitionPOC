import React, { useEffect, useMemo, useState } from 'react'
import IUser from '../models/iuser'
import IAuthenticationResponse from '../models/dto/iauthentication-response'
import jwtDecode from 'jwt-decode'
import IAuthenticationContext from '../models/iauthentication-context'
import { AuthenticationContext } from '../hooks/authentication-context'
import UserContext from '../hooks/user-context'

interface props {
    children: React.ReactNode
}

const AuthenticationProvider = ({ children }: props) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'))
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user')
        return storedUser === null ? null : JSON.parse(storedUser) as IUser
    })

    useEffect(() => {
        if (accessToken && refreshToken && user) {
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))
        }
        else {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        }
    }, [refreshToken])

    const setTokens = (authenticationResponse?: IAuthenticationResponse) => {
        const decodedToken = authenticationResponse === undefined
            ? null
            : jwtDecode<IUser>(authenticationResponse.accessToken)

        setUser(decodedToken)
        setAccessToken(authenticationResponse?.accessToken || null)
        setRefreshToken(authenticationResponse?.refreshToken || null)
    }

    const contextValue = useMemo((): IAuthenticationContext => ({
        accessToken,
        refreshToken,
        setTokens
    }), [refreshToken])

    return (
        <AuthenticationContext.Provider value={contextValue}>
            <UserContext.Provider value={{ user: user!, setUser }}>
                { children }
            </UserContext.Provider>
        </AuthenticationContext.Provider>
    )
}

export default AuthenticationProvider
