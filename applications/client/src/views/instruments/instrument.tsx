import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import IInstrument from '../../models/iintrument'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import InstrumentInformation from './components/instrument-information'

const Instrument = () => {
    const [instrument, setInstrument] = useState<IInstrument>()

    const { id } = useParams()
    const { getInstrument } = useAuthenticatedApi()

    useEffect(() => {
        getInstrument(parseInt(id!))
            .then(response => setInstrument(response))
    }, [])

    return (
        <div className='instrument-container'>
            <div style={{ backgroundColor: 'red', height: '20vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                Chart
            </div>
            <InstrumentInformation instrument={instrument} />
        </div>
    )
}

export default Instrument
