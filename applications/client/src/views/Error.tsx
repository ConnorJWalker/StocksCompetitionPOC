import React from 'react'
import { Link } from 'react-router-dom'

const Error = () => {
    return (
        <div className='error-container'>
            <h1>Something has gone wrong</h1>
            <h2>Better error handling is on the todo list</h2>
            <Link to={'/'}>Click here to go home</Link>
        </div>
    )
}

export default Error
