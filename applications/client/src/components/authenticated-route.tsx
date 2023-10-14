import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthentication from '../hooks/authentication-context'
import Container from '../views/container'

const AuthenticatedRoute = () => {
    const { accessToken } = useAuthentication()

    if (!accessToken) {
        return <Navigate to='/login' replace={true} />
    }

    return (
        <Container>
            <Outlet />
        </Container>
    )
}

export default AuthenticatedRoute
