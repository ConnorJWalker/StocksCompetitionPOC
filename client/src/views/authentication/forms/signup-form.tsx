import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SignUpValidator from '../../../utils/sign-up-validator'
import ValidationErrors from './validation-errors'
import { GetEmptySignupForm } from '../../../models/dto/isignup-form'
import { HttpError } from '../../../services/api-service'
import AuthenticationService from '../../../services/authentication-service'

const SignupForm = ({ ChangePage }: any) => {
    const validator = new SignUpValidator()
    const [showMainForm, setShowMainForm] = useState(true)
    const [validationErrors, setValidationErrors] = useState(validator.validationErrors)
    const [signupForm, setSignupForm] = useState(GetEmptySignupForm())

    const navigate = useNavigate()

    return showMainForm ? renderMainForm() : renderApiKeyForm()

    function renderMainForm() {
        return (
            <>
                <h1>Sign Up</h1>
                <div className='form-group'>
                    {/* TODO: add image for profile picture  */}
                    <div className='profile-picture'>
                        <p>Picture</p>
                    </div>

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
                            placeholder='Discrod Username'
                            value={signupForm.discordUsername}
                            onChange={e => setSignupForm({ ...signupForm, discordUsername: e.target.value })}
                            onBlur={() => setValidationErrors({
                                ...validationErrors,
                                discordUsername: validator.validateDiscordUsername(signupForm.discordUsername) })} />
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
                            hidden />
                    </label>
                </div>

                <footer>
                    <button className='link' onClick={ChangePage}>Log In</button>
                    <button className='btn-pink' onClick={nextButtonClick}>Next</button>
                </footer>
            </>
        )
    }

    function renderApiKeyForm() {
        return (
            <>
                <h1>Trading 212 Api Key</h1>
                <ul className='api-key-instructions'>
                    <li>Open Trading 212 into invest account (not ISA or CFD)</li>
                    <li>Click Settings -&gt; Api (Beta) -&gt; Generate API Key</li>
                    <li>Set all permission toggle (except Orders - Execute) to on</li>
                    <li>Click Generate key and copy to the text area below</li>
                </ul>

                <textarea
                    value={signupForm.apiKey}
                    onChange={e => setSignupForm({ ...signupForm, apiKey: e.target.value })} />

                <footer>
                    <button className='link'>Log In</button>

                    <div>
                        <button onClick={() => setShowMainForm(true)}>Back</button>
                        <button className='btn-pink' onClick={signupButtonClick}>Sign Up</button>
                    </div>
                </footer>
            </>
        )
    }

    function nextButtonClick() {
        if (validator.mainFormIsValid(signupForm)) {
            setShowMainForm(false)
            return
        }

        setValidationErrors({ ...validator.validationErrors })
    }

    async function signupButtonClick() {
        if (!signupForm.apiKey) return

        try {
            await AuthenticationService.SignUp(signupForm)
            navigate(0)
        }
        catch (error) {
            if (error instanceof HttpError) {
                // TODO: display errors to user
                console.log(error)
                return
            }

            throw error
        }
    }
}

export default SignupForm
