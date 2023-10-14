import React, { FormEvent, useState } from 'react'
import { GetEmptyLoginForm } from '../../../models/dto/ilogin-form'
import HttpError from '../../../models/http-error'
import ValidationErrors from './validation-errors'
import useLogin from '../../../hooks/use-login'

const LoginForm = ({ ChangePage }: any) => {
    const [loginForm, setLoginForm] = useState(GetEmptyLoginForm())
    const [discordUsernameErrors, setDiscordUsernameErrors] = useState<string[]>([])
    const [passwordErrors, setPasswordErrors] = useState<string[]>([])
    const [serverErrors, setServerErrors] = useState<string[]>([])

    const login = useLogin()

    return (
        <form onSubmit={onSubmit}>
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

            <ValidationErrors errors={serverErrors} />

            <footer>
                <button className='link' type='button' onClick={ChangePage}>Sign Up</button>
                <button className='btn-action'>Log In</button>
            </footer>
        </form>
    )

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (validatePassword().length > 0 || validatePassword().length > 0) {
            return
        }

        try {
            await login(loginForm)
        }
        catch (error) {
            if (error instanceof HttpError) {
                setServerErrors([error.response.error!])
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
