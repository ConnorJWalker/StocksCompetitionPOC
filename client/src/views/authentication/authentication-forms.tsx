import React, { useEffect, useState } from 'react'
import SignupForm from './forms/signup-form'
import LoginForm from './forms/login-form'
import './authentication.css'

const AuthenticationForms = () => {
    const [showSignup, setShowSignup] = useState(true)

    useEffect(() => { document.title = 'Stocks Competition' }, [])

    return (
        <div className='authentication-container'>
            <div className='form-container'>
                {
                    showSignup
                        ? <SignupForm ChangePage={changePage} />
                        : <LoginForm ChangePage={changePage} />
                }
            </div>
        </div>
    )

    function changePage() {
        setShowSignup(!showSignup)
    }
}

export default AuthenticationForms
