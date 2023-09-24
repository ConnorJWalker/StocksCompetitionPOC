import React from 'react'
import UserChart from '../../components/user-chart'
import { useParams } from 'react-router-dom'
import UserInfo from './user-info'
import Feed from '../../components/feed'
import '../home.css'

const Profile = () => {
    const { discordUsername } = useParams()

    return (
        <div className='home-container'>
            <UserChart discordUsername={discordUsername} />
            <UserInfo discordUsername={discordUsername} />
            <Feed discordUsername={discordUsername} />
        </div>
    )
}

export default Profile
