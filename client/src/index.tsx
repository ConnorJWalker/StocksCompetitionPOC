import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthenticationForms from './views/authentication/authentication-forms'
import './index.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthenticationForms />
    }
])

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
