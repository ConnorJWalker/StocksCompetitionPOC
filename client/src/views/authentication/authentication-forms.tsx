import React, { useState } from 'react'
import SignupForm from './forms/signup-form'
import LoginForm from './forms/login-form'
import './authentication.css'

const AuthenticationForms = () => {
    const [showSignup, setShowSignup] = useState(true)

    return (
        <div className='authentication-container'>
            <div className='form-container'>
                { showSignup ? <SignupForm/> : <LoginForm/> }
            </div>
        </div>
    )
}

export default AuthenticationForms
