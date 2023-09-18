import React, { ReactNode, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './views/home/Home'
import AuthenticationForms from './views/authentication/authentication-forms'
import UserContext from './context'
import IUser from './models/iuser'

const App = () => {
    const router = createBrowserRouter([
        {
            path: '/',
            element: authenticateView(<Home />)
        }
    ])

    return <RouterProvider router={router} />

    function authenticateView(element: ReactNode) {
        if (!localStorage.getItem('accessToken')) {
            return <AuthenticationForms />
        }

        const userString = localStorage.getItem('user')

        // something has gone wrong, log the user out
        if (userString === null) {
            localStorage.removeItem('authenticationToken')
            return <AuthenticationForms />
        }

        const [user] = useState<IUser>(JSON.parse(userString))
        return (
            <UserContext.Provider value={user}>
                { element }
            </UserContext.Provider>
        )
    }
}

export default App
