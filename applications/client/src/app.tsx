import React, { useRef } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import io from 'socket.io-client'
import Home from './views/home'
import Profile from './views/profile/profile'
import AuthenticationForms from './views/authentication/authentication-forms'
import AuthenticatedRoute from './components/authenticated-route'
import AuthenticationProvider from './components/authentication-provider'
import SocketContext from './hooks/socket-context'
import Following from './views/following'
import Settings from './views/settings'
import AdminSettings from './views/admin-settings'
import Error from './views/Error'

const App = () => {
    const socket = useRef(io(process.env.REACT_APP_SOCKET_URL!, { secure: true }))

    const router = createHashRouter([
        {
            path: '/login',
            element: <AuthenticationForms />,
            errorElement: <Error />
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
                    element: <Following />
                },
                {
                    path: '/search',
                    element: <h1>Not done yet</h1>
                },
                {
                    path: '/profile/:discordUsername',
                    element: <Profile />
                },
                {
                    path: '/settings',
                    element: <Settings />
                },
                {
                    path: '/settings/:discordUsername',
                    element: <AdminSettings />
                }
            ],
            errorElement: <Error />
        }
    ], { basename: process.env.REACT_APP_URL || '' })

    return (
        <SocketContext.Provider value={socket.current}>
            <AuthenticationProvider>
                <RouterProvider router={router} />
            </AuthenticationProvider>
        </SocketContext.Provider>
    )
}

export default App
