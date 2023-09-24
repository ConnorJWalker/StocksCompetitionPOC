import React, { useEffect, useState } from 'react'
import ApiService from '../../services/api-service'
import IAccountValueResponse from '../../models/dto/feed/i-account-value-response'

const Leaderboards = () => {
    const [accountValues, setAccountValues] = useState<IAccountValueResponse[]>([])

    useEffect(() => {
        ApiService.GetLeaderboards()
            .then(response => setAccountValues(response.content))
            .catch(err => console.log(err))
    }, [])

    return (
        <div className='leaderboards-container'>
            <div>
                <h2>Leaderboards</h2>
                <div className='leaderboards'>
                    {
                        accountValues.map((account, index) => (
                            <div className='leaderboard-item' key={index}>
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
