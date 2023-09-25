import React from 'react'
import UserChart from '../../components/user-chart'
import { useLoaderData } from 'react-router-dom'
import UserInfo from './user-info'
import Feed from '../../components/feed'
import { IProfileLoaderData } from '../../loaders/profile-loader'
import '../home.css'

const Profile = () => {
    const profileData = useLoaderData() as IProfileLoaderData

    return (
        <div className='home-container'>
            <UserChart data={profileData.userChart} />
            <UserInfo userInfo={profileData.userInfo} />
            <Feed posts={profileData.feed} />
        </div>
    )
}

export default Profile
