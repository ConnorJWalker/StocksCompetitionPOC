import React, { ReactNode, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import UserContext from './context'
import IUser from './models/iuser'
import Container from './views/container'
import Home from './views/home/home'
import Profile from './views/profile/profile'
import AuthenticationForms from './views/authentication/authentication-forms'
import AuthenticationService from './services/authentication-service'
import ProfileLoader from './loaders/profile-loader'
import HomeLoader from './loaders/home-loader'

const App = () => {
    const [user, setUser] = useState<IUser | null>(null)

    const router = createBrowserRouter([
        {
            path: '/',
            loader: async () => await HomeLoader(),
            element: authenticateView(<Home />, 0)
        },
        {
            path: '/following',
            loader: async () => await HomeLoader(),
            element: authenticateView(<Home />, 1)
        },
        {
            path: '/search',
            loader: async () => await HomeLoader(),
            element: authenticateView(<Home />, 2)
        },
        {
            path: '/profile/:discordUsername',
            loader: async ({ params }) => await ProfileLoader(params.discordUsername || ''),
            element: authenticateView(<Profile />, 3)
        }
    ])

    return <RouterProvider router={router} />

    function authenticateView(element: ReactNode, tabIndex: number) {
        if (!localStorage.getItem('accessToken')) {
            return <AuthenticationForms />
        }

        if (user === null) {
            const userString = localStorage.getItem('user')

            // something has gone wrong, log the user out
            if (userString === null) {
                AuthenticationService.LogOut()
                return <AuthenticationForms />
            }

            setUser(JSON.parse(userString))
        }

        return (
            <UserContext.Provider value={user!}>
                <Container tabIndex={tabIndex}>
                    { element }
                </Container>
            </UserContext.Provider>
        )
    }
}

export default App
