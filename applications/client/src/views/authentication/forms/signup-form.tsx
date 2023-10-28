import React, { FormEvent, useState } from 'react'
import SignUpValidator from '../../../utils/sign-up-validator'
import ValidationErrors from './validation-errors'
import ISignupForm, { GetEmptySignupForm } from '../../../models/dto/isignup-form'
import HttpError from '../../../models/http-error'
import useSignup from '../../../hooks/use-signup'
import useApi from '../../../hooks/useApi'

//@ts-ignore
const isSafari = /constructor/i.test(window.HTMLElement) || ((p: any) => p.toString() === "[object SafariRemoteNotification]")(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))

const SignupForm = ({ ChangePage }: any) => {
    const validator = new SignUpValidator()
    const [showMainForm, setShowMainForm] = useState(true)
    const [validationErrors, setValidationErrors] = useState(validator.validationErrors)
    const [signupForm, setSignupForm] = useState<ISignupForm>(GetEmptySignupForm())

    const signup = useSignup()
    const { getDiscordProfilePicture } = useApi()

    return showMainForm ? renderMainForm() : renderApiKeyForm()

    function renderMainForm() {
        return (
            <form onSubmit={onMainFormSubmit}>
                <h1>Sign Up</h1>
                <div className='form-group'>
                    { renderProfilePicture() }

                    <div className='text-input-group'>
                        <ValidationErrors errors={validationErrors.displayName} />
                        <input
                            type='text'
                            placeholder='Display Name'
                            value={signupForm.displayName}
                            onChange={e => setSignupForm({ ...signupForm, displayName: e.target.value })}
                            onBlur={() => setValidationErrors({
                                ...validationErrors,
                                displayName: validator.validateDisplayName(signupForm.displayName) })} />

                        <ValidationErrors errors={validationErrors.discordUsername} />
                        <input
                            type='text'
                            placeholder='Discord Username'
                            value={signupForm.discordUsername}
                            onChange={e => setSignupForm({ ...signupForm, discordUsername: e.target.value })}
                            onBlur={discordUsernameOnBlur} />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='text-input-group'>
                        <ValidationErrors errors={validationErrors.password} />
                        <input
                            type='password'
                            placeholder='Password'
                            value={signupForm.password}
                            onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                            onBlur={() => setValidationErrors({
                                ...validationErrors,
                                password: validator.validatePassword(signupForm.password) })} />

                        <ValidationErrors errors={validationErrors.confirmPassword} />
                        <input
                            type='password'
                            placeholder='Confirm Password'
                            value={signupForm.passwordConfirm}
                            onChange={e => setSignupForm({ ...signupForm, passwordConfirm: e.target.value })}
                            onBlur={() => setValidationErrors({
                                ...validationErrors,
                                confirmPassword: validator.validateConfirmPassword(signupForm.password, signupForm.passwordConfirm) })} />
                    </div>

                    <label className='colour-picker' style={{ backgroundColor: signupForm.displayColour }}>
                        <span><small>Colour</small></span>
                        <input
                            type='color'
                            value={signupForm.displayColour}
                            onChange={e => setSignupForm({ ...signupForm, displayColour: e.target.value })}
                            hidden={!isSafari} />
                    </label>
                </div>

                <footer>
                    <button className='link' type='button' onClick={ChangePage}>Have an account? Log In</button>
                    <button className='btn-action'>Next</button>
                </footer>
            </form>
        )
    }

    function renderApiKeyForm() {
        return (
            <form onSubmit={apiKeyFormSubmit}>
                <h1>Trading 212 Api Key</h1>
                <ul className='api-key-instructions'>
                    <li>Open Trading 212 into invest account (not ISA or CFD)</li>
                    <li>Click Settings -&gt; Api (Beta) -&gt; Generate API Key</li>
                    <li>Set all permission toggle (except Orders - Execute) to on</li>
                    <li>Click Generate key and copy to the text area below</li>
                </ul>

                <ValidationErrors errors={validationErrors.apiKey} />
                <textarea
                    value={signupForm.apiKey}
                    onChange={e => setSignupForm({ ...signupForm, apiKey: e.target.value })} />

                <footer>
                    <button className='link'>Have an account? Log In</button>

                    <div>
                        <button type='button' onClick={() => setShowMainForm(true)}>Back</button>
                        <button className='btn-action'>Sign Up</button>
                    </div>
                </footer>
            </form>
        )
    }

    function renderProfilePicture() {
        if (signupForm.profilePicture === undefined) {
            return (
                <div className='profile-picture'>
                    <p>Picture</p>
                </div>
            )
        }

        return <img className='profile-picture' src={signupForm.profilePicture} alt='discord profile picture' />
    }

    async function discordUsernameOnBlur() {
        const discordValidationErrors = await validator.validateDiscordUsername(signupForm.discordUsername)
        setValidationErrors({ ...validationErrors, discordUsername: discordValidationErrors })

        if (discordValidationErrors.length === 0) {
            const profilePicture = await getDiscordProfilePicture(signupForm.discordUsername)
            setSignupForm({ ...signupForm, profilePicture })
        }
    }

    async function onMainFormSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (await validator.mainFormIsValid(signupForm)) {
            setShowMainForm(false)
            return
        }

        setValidationErrors({ ...validator.validationErrors })
    }

    async function apiKeyFormSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!signupForm.apiKey) {
            setValidationErrors({ ...validationErrors, apiKey: ['Api key is required'] })
            return
        }

        try {
            await signup(signupForm)
        }
        catch (error) {
            if (error instanceof HttpError) {
                const errors = error.response!.errors!
                setValidationErrors({ ...validationErrors, ...errors })

                // if there are errors for the main page, move back to main page
                // to prevent errors from being hidden from the user
                const errorKeys = Object.keys(errors)
                if (errorKeys.length > 1 || errorKeys[0] !== 'apiKey') {
                    setShowMainForm(true)
                }

                return
            }

            throw error
        }
    }
}

export default SignupForm
