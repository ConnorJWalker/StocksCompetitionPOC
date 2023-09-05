import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetEmptyLoginForm } from '../../../models/dto/ilogin-form'
import AuthenticationService from '../../../services/authentication-service'
import { HttpError } from '../../../services/api-service'
import ValidationErrors from './validation-errors'

const LoginForm = ({ ChangePage }: any) => {
    const [loginForm, setLoginForm] = useState(GetEmptyLoginForm())
    const [discordUsernameErrors, setDiscordUsernameErrors] = useState<string[]>([])
    const [passwordErrors, setPasswordErrors] = useState<string[]>([])

    const navigate = useNavigate()

    return (
        <>
            <h1>Log In</h1>
            <div className='form-group'>
                <div className='text-input-group'>
                    <ValidationErrors errors={discordUsernameErrors} />
                    <input
                        type='text'
                        placeholder='Discord Username'
                        value={loginForm.discordUsername}
                        onChange={e => setLoginForm({ ...loginForm, discordUsername: e.target.value })}
                        onBlur={() => setDiscordUsernameErrors(validateDiscordUsername())}
                        style={{ marginBottom: '10px' }} />

                    <ValidationErrors errors={passwordErrors} />
                    <input
                        type='password'
                        placeholder='Password'
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                        onBlur={() => setPasswordErrors(validatePassword())} />
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
        if (validatePassword().length > 0 || validatePassword().length > 0) {
            return
        }

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

    function validateDiscordUsername() {
        if (!loginForm.discordUsername) {
            return ['Discord Username is required']
        }

        const length = loginForm.discordUsername.length
        if (length < 2 || length > 32) {
            return ['Discord Usernames must be between 2 and 32 characters long']
        }

        return []
    }

    function validatePassword() {
        if (!loginForm.password) {
            return ['Password is required']
        }

        return []
    }
}

export default LoginForm
