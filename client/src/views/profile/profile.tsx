import React, { useEffect, useRef, useState } from 'react'
import UserChart from '../../components/user-chart'
import { useParams } from 'react-router-dom'
import UserInfo from './user-info'
import Feed from '../../components/feed'
import IProfileLoaderData from '../../models/pages/iprofile-data'
import '../home.css'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'

const Profile = () => {
    const previousProfile = useRef<string>('')
    const [profileData, setProfileData] = useState<IProfileLoaderData | null>(null)

    const { discordUsername } = useParams()
    const { getProfileData } = useAuthenticatedApi()

    useEffect(() => {
        if (discordUsername !== previousProfile.current) {
            previousProfile.current = discordUsername!
            getProfileData(discordUsername!)
                .then(response => setProfileData(response))
                .catch(err => console.error(err))
        }
    }, [discordUsername])


    return profileData === null ? <></> : (
        <div className='home-container'>
            <UserChart data={profileData.userChart} />
            <UserInfo userInfo={profileData.userInfo} />
            <Feed posts={profileData.feed} />
        </div>
    )
}

export default Profile
