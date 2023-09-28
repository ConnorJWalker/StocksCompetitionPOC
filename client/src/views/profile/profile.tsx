import React, { useEffect, useRef, useState } from 'react'
import UserChart from '../../components/user-chart'
import { useParams } from 'react-router-dom'
import UserInfo from './user-info'
import Feed from '../../components/feed'
import IProfileLoaderData from '../../models/pages/iprofile-data'
import '../home.css'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import { useSocket } from '../../hooks/socket-context'
import IAccountValueResponse from '../../models/dto/feed/i-account-value-response'

const Profile = () => {
    const [profileData, setProfileData] = useState<IProfileLoaderData | null>(null)
    const profileDataRef = useRef(profileData)
    const previousProfile = useRef('')

    profileDataRef.current = profileData

    const { discordUsername } = useParams()
    const { getProfileData } = useAuthenticatedApi()
    const socket = useSocket()

    const onAccountValuesUpdate = (updatedValues: IAccountValueResponse[]) => {
        if (profileDataRef.current === null) return

        const userValue = updatedValues.find(value => value.user.discordUsername === discordUsername)
        if (userValue !== undefined) {
            setProfileData({
                ...profileDataRef.current,
                userInfo: {
                    ...profileDataRef.current.userInfo,
                    accountValue: {
                        ...profileDataRef.current.userInfo.accountValue,
                        value: userValue
                    }
                }
            })
        }
    }

    useEffect(() => {
        if (discordUsername !== previousProfile.current) {
            previousProfile.current = discordUsername!
            getProfileData(discordUsername!)
                .then(response => setProfileData(response))
                .catch(err => console.error(err))
        }
    }, [discordUsername])

    useEffect(() => {
        socket.on('account-values-update', data => onAccountValuesUpdate(JSON.parse(data)))
        return () => { socket.off('account-values-update') }
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
