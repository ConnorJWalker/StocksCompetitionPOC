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
import Search from './views/instruments/search'
import Instrument from './views/instruments/instrument'
import Settings from './views/settings'
import AdminSettings from './views/admin-settings'
import Error from './views/Error'
import { CategoryScale, Chart as ChartJs, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js'

ChartJs.register(Legend, CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

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
                    element: <Search />
                },
                {
                    path: '/instrument/:id',
                    element: <Instrument />
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
