import React from 'react'
import IAccountValueResponse from '../../models/dto/feed/iaccount-value-response'
import { useNavigate } from 'react-router-dom'

interface props {
    data: IAccountValueResponse[]
}

const Leaderboards = ({ data }: props) => {
    const navigate = useNavigate()

    return (
        <div className='leaderboards-container'>
            <div>
                <h2>Leaderboards</h2>
                <div className='leaderboards'>
                    {
                        data.map((account, index) => (
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
