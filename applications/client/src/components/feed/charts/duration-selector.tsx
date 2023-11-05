import React, { useState } from 'react'

interface props {
    durations: string[]
    onChange: (duration: string) => void
}

const DurationSelector = ({ durations, onChange }: props) => {
    const [currentDuration, setCurrentDuration] = useState(durations[0])

    const onClick = (duration: string) => {
        if (duration !== currentDuration) {
            setCurrentDuration(duration)
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
