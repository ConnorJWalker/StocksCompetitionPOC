import React from 'react'
import IAccountValueResponse from '../../models/dto/feed/i-account-value-response'

interface props {
    data: IAccountValueResponse[]
}

const Leaderboards = ({ data }: props) => {
    return (
        <div className='leaderboards-container'>
            <div>
                <h2>Leaderboards</h2>
                <div className='leaderboards'>
                    {
                        data.map((account, index) => (
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
