import React, { useEffect, useState } from 'react'
import UserChart from '../../components/user-chart'
import { useNavigate, useParams } from 'react-router-dom'
import UserInfo from './user-info'
import Feed from '../../components/feed'
import ProfileLoader, { IProfileLoaderData } from '../../loaders/profile-loader'
import '../home.css'

const Profile = () => {
    const [profileData, setProfileData] = useState<IProfileLoaderData | null>(null)

    const { discordUsername } = useParams()
    const navigate = useNavigate()

    if (discordUsername === undefined) {
        navigate('/')
    }

    useEffect(() => {
        ProfileLoader(discordUsername!)
            .then(data => setProfileData(data))
            .catch(err => console.error(err))
    }, [])

    return profileData === null ? <></> : (
        <div className='home-container'>
            <UserChart data={profileData.userChart} />
            <UserInfo userInfo={profileData.userInfo} />
            <Feed posts={profileData.feed} />
        </div>
    )
}

export default Profile
