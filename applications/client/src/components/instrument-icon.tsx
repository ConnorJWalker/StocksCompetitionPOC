import React from 'react'

interface props {
    url: string
    ticker: string
}

const InstrumentIcon = ({ url, ticker }: props) => (
    <object data={url} type='image/png'>
        <div className='instrument-icon-fallback'>
            { ticker }
        </div>
    </object>
)

export default InstrumentIcon
