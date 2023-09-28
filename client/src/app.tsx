import React, { useRef } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import io from 'socket.io-client'
import Home from './views/home/home'
import Profile from './views/profile/profile'
import AuthenticationForms from './views/authentication/authentication-forms'
import AuthenticatedRoute from './components/authenticated-route'
import AuthenticationProvider from './components/authentication-provider'
import SocketContext from './hooks/socket-context'

const App = () => {
    const socket = useRef(io(process.env.REACT_APP_SOCKET_URL!))

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
        <SocketContext.Provider value={socket.current}>
            <AuthenticationProvider>
                <RouterProvider router={router} />
            </AuthenticationProvider>
        </SocketContext.Provider>
    )
}

export default App
