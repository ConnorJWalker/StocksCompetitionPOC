import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import InstrumentIcon from '../../../components/instrument-icon'
import IInstrument from '../../../models/iintrument'
import IUser from '../../../models/iuser'
import useAuthenticatedApi from '../../../hooks/useAuthenticatedApi'

interface props {
    instrument?: IInstrument
}

const InstrumentInformation = ({ instrument }: props) => {
    const [owningUsers, setOwningUsers] = useState<IUser[]>([])

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
            <p>{ instrument?.ticker }</p>

            <h2>Owned by</h2>
            {
                owningUsers.map(user => (
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
