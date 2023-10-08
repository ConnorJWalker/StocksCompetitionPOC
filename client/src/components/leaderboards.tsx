import React, { useEffect, useRef, useState } from 'react'
import IAccountValueResponse from '../models/dto/feed/iaccount-value-response'
import { useNavigate } from 'react-router-dom'
import useAuthenticatedApi from '../hooks/useAuthenticatedApi'
import { useSocket } from '../hooks/socket-context'
import orderLeaderboards from '../utils/order-leaderboards'

interface props {
    controller: 'feed' | 'following'
}

const Leaderboards = ({ controller }: props) => {
    const [accountValues, setAccountValues] = useState<IAccountValueResponse[]>([])
    const accountValuesRef = useRef<IAccountValueResponse[]>([])

    const navigate = useNavigate()
    const socket = useSocket()
    const { getLeaderboards } = useAuthenticatedApi()

    accountValuesRef.current = accountValues

    const onAccountValuesUpdate = (updatedValues: IAccountValueResponse[]) => {
        const leaderboards = accountValuesRef.current
        updatedValues.forEach(value => {
            const userIndex = leaderboards.findIndex(user => user.user.id === value.user.id)

            if (userIndex === undefined || userIndex === -1 && controller !== 'following') {
                leaderboards.push(value)
                return
            }

            leaderboards[userIndex] = value
        })

        setAccountValues([...orderLeaderboards(leaderboards)])
    }

    useEffect(() => {
        getLeaderboards(controller).then(response => setAccountValues(response))

        socket.on('account-values-update', data => onAccountValuesUpdate(JSON.parse(data)))
        return () => { socket.off('account-values-update') }
    }, [])

    return (
        <div className='leaderboards-container'>
            <div>
                <h2>Leaderboards</h2>
                <div className='leaderboards'>
                    {
                        accountValues.map((account, index) => (
                            <div className='leaderboard-item' onClick={() => navigate(`/profile/${account.user.discordUsername}`)} key={index}>
                                <img src={account.user.profilePicture} alt={`${account.user.displayName}'s profile picture`}/>
                                <p>{ account.user.displayName }</p>
                                <p>£{ account.values.total }</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Leaderboards
