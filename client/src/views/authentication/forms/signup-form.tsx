import React, { useState } from 'react'

const SignupForm = () => {
    const [showMainForm, setShowMainForm] = useState(true)

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
                        <input type='text' placeholder='Display Name' />
                        <input type='text' placeholder='Discrod Username' />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='text-input-group'>
                        <input type='password' placeholder='Password' />
                        <input type='password' placeholder='Confirm Password' />
                    </div>

                    <label className='colour-picker' style={{ backgroundColor: 'red' }}>
                        <span><small>Colour</small></span>
                        <input type='color' hidden />
                    </label>
                </div>

                <footer>
                    <button className='link'>Log In</button>
                    <button className='btn-pink'>Next</button>
                </footer>
            </>
        )
    }

    function renderApiKeyForm() {
        return <></>
    }
}

export default SignupForm
