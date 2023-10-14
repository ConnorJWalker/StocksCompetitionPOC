import React from 'react'

interface IValidationErrorsProps {
    errors: string[]
}

const ValidationErrors = ({ errors }: IValidationErrorsProps) => {
    return (
        <ul className='validation-errors'>
            {
                errors.map((error, index) => <li key={index}>{ error }</li>)
            }
        </ul>
    )
}

export default ValidationErrors
