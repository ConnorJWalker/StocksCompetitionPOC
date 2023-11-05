import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import InstrumentIcon from '../../../components/instrument-icon'
import IInstrument from '../../../models/iintrument'
import IUser from '../../../models/iuser'
import useAuthenticatedApi from '../../../hooks/useAuthenticatedApi'
import ICompanyData from '../../../models/dto/icompany-data'

interface props {
    instrument?: IInstrument
    companyData?: ICompanyData
}

const InstrumentInformation = ({ instrument, companyData }: props) => {
    const [owningUsers, setOwningUsers] = useState<IUser[]>([])
    const [expandDescription, setExpandDescription] = useState(false)

    const { getOwningUsers } = useAuthenticatedApi()

    useEffect(() => {
        if (instrument !== undefined) {
            getOwningUsers(instrument.id)
                .then(users => setOwningUsers(users))
        }
    }, [instrument])

    return (
        <section className='instrument-information-container'>
            <InstrumentIcon url={instrument?.icon || ''} ticker={instrument?.ticker || ''} />
            <h2>{ instrument?.name }</h2>
            <h3>{ instrument?.ticker }</h3>

            <p className='company-description' style={{ maxHeight: expandDescription ? '' : '90px' }}>
                { companyData?.description }
            </p>
            { companyData !== undefined &&
                <div className='company-description-toggle' onClick={() => setExpandDescription(!expandDescription)}>
                    <span style={{ transform: expandDescription ? 'none' : 'rotate(180deg)' }}>^</span>
                </div>
            }

            <h2>Owned by</h2>
            {
                owningUsers.length === 0
                    ? <p>Nobody currently owns this instrument</p>
                    : owningUsers.map(user => (
                        <Link to={`/profile/${user.discordUsername}`}>
                            <div className='owning-user' key={user.id}>
                                <img
                                    src={process.env.REACT_APP_SERVER_URL + user.profilePicture}
                                    alt={`${user.displayName}'s profile picture`} />
                                <span>
                                    <h3>{ user.displayName }</h3>
                                    <p>{ user.discordUsername }</p>
                                </span>
                            </div>
                        </Link>
                    ))
            }
        </section>
    )
}

export default InstrumentInformation
