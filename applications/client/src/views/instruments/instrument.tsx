import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import IInstrument from '../../models/iintrument'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import InstrumentInformation from './components/instrument-information'
import InstrumentChart from './components/instrument-chart'

const Instrument = () => {
    const [instrument, setInstrument] = useState<IInstrument>()

    const { id } = useParams()
    const { getInstrument } = useAuthenticatedApi()

    useEffect(() => {
        getInstrument(parseInt(id!))
            .then(response => setInstrument(response))
    }, [])

    return (
        <div className='home-container'>
            { instrument !== undefined && <InstrumentChart id={instrument.id} /> }
            <InstrumentInformation instrument={instrument} />
        </div>
    )
}

export default Instrument
