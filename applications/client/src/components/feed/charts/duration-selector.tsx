import React from 'react'

interface props {
    durations: string[]
    currentDuration: string
    onChange: (duration: string) => void
}

const DurationSelector = ({ durations, currentDuration, onChange }: props) => {
    const onClick = (duration: string) => {
        if (duration !== currentDuration) {
            onChange(duration)
        }
    }

    return (
        <span className='chart-duration-container'>
            {
                durations.map(duration => (
                    <span className={currentDuration === duration ? 'selected' : ''} onClick={() => onClick(duration)}>
                        { duration }
                    </span>
                ))
            }
        </span>
    )
}

export default DurationSelector
