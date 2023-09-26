import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './views/home/home'
import Profile from './views/profile/profile'
import AuthenticationForms from './views/authentication/authentication-forms'
import AuthenticatedRoute from './components/authenticated-route'
import AuthenticationProvider from './components/authentication-provider'

const App = () => {
    const router = createBrowserRouter([
        {
            path: '/login',
            element: <AuthenticationForms />
        },
        {
            path: '/',
            element: <AuthenticatedRoute />,
            children: [
                {
                    path: '/',
                    element: <Home />
                },
                {
                    path: '/following',
                    element: <Home />
                },
                {
                    path: '/search',
                    element: <Home />
                },
                {
                    path: '/profile/:discordUsername',
                    element: <Profile />
                }
            ]
        }
    ])

    return (
        <AuthenticationProvider>
            <RouterProvider router={router} />
        </AuthenticationProvider>
    )
}

export default App
