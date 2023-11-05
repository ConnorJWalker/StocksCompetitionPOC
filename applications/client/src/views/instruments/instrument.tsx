import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import IInstrument from '../../models/iintrument'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import InstrumentInformation from './components/instrument-information'
import InstrumentChart from '../../components/feed/charts/instrument-chart'
import ICompanyData from '../../models/dto/icompany-data'

const Instrument = () => {
    const [instrument, setInstrument] = useState<IInstrument>()
    const [companyData, setCompanyData] = useState<ICompanyData>()

    const { id } = useParams()
    const { getInstrument, getCompanyData } = useAuthenticatedApi()

    useEffect(() => {
        if (id) {
            getInstrument(parseInt(id))
                .then(response => setInstrument(response))

            getCompanyData(parseInt(id))
                .then(response => setCompanyData(response))
        }
    }, [id])

    return (
        <div className='home-container'>
            { instrument !== undefined && <InstrumentChart id={instrument.id} /> }
            <InstrumentInformation
                instrument={instrument}
                companyData={companyData} />
        </div>
    )
}

export default Instrument
