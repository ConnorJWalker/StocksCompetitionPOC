import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetEmptyLoginForm } from '../../../models/dto/ilogin-form'
import AuthenticationService from '../../../services/authentication-service'
import { HttpError } from '../../../services/api-service'

const LoginForm = ({ ChangePage }: any) => {
    const [loginForm, setLoginForm] = useState(GetEmptyLoginForm())
    const navigate = useNavigate()

    return (
        <>
            <h1>Log In</h1>
            <div className='form-group'>
                <div className='text-input-group'>
                    <input
                        type='text'
                        placeholder='Discord Username'
                        value={loginForm.discordUsername}
                        onChange={e => setLoginForm({ ...loginForm, discordUsername: e.target.value })}
                        style={{ marginBottom: '10px' }} />

                    <input
                        type='password'
                        placeholder='Password'
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                </div>
            </div>

            <footer>
                <button className='link' onClick={ChangePage}>Sign Up</button>
                <button className='btn-pink' onClick={loginButtonClick}>Log In</button>
            </footer>
        </>
    )

    async function loginButtonClick() {
        // TODO: display validation errors
        if (!loginForm.discordUsername || !loginForm.password) return

        try {
            await AuthenticationService.LogIn(loginForm)
            navigate(0)
        }
        catch (error) {
            if (error instanceof HttpError) {
                // TODO: display error
                console.log(error.statusCode, error.response)
                return
            }

           throw error
        }
    }
}

export default LoginForm
