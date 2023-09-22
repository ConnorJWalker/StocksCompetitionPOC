import React, { ReactNode, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import UserContext from './context'
import IUser from './models/iuser'
import Container from './views/container'
import Home from './views/home/Home'
import AuthenticationForms from './views/authentication/authentication-forms'
import AuthenticationService from './services/authentication-service'

const App = () => {
    const router = createBrowserRouter([
        {
            path: '/',
            element: authenticateView(<Home />, 0)
        },
        {
            path: '/following',
            element: authenticateView(<Home />, 1)
        },
        {
            path: '/search',
            element: authenticateView(<Home />, 2)
        },
        {
            path: '/profile',
            element: authenticateView(<Home />, 3)
        }
    ])

    return <RouterProvider router={router} />

    function authenticateView(element: ReactNode, tabIndex: number) {
        if (!localStorage.getItem('accessToken')) {
            return <AuthenticationForms />
        }

        const userString = localStorage.getItem('user')

        // something has gone wrong, log the user out
        if (userString === null) {
            AuthenticationService.LogOut()
            return <AuthenticationForms />
        }

        const [user] = useState<IUser>(JSON.parse(userString))
        return (
            <UserContext.Provider value={user}>
                <Container tabIndex={tabIndex}>
                    { element }
                </Container>
            </UserContext.Provider>
        )
    }
}

export default App
