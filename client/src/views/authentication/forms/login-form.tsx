import React from 'react'

const LoginForm = ({ ChangePage }: any) => {
    return (
        <>
            <h1>Log In</h1>
            <div className='form-group'>
                <div className='text-input-group'>
                    <input type='text' placeholder='Discord Username' style={{ marginBottom: '10px' }} />
                    <input type='password' placeholder='Password' />
                </div>
            </div>

            <footer>
                <button className='link' onClick={ChangePage}>Sign Up</button>
                <button className='btn-pink'>Log In</button>
            </footer>
        </>
    )
}

export default LoginForm
