import React, { useEffect, useRef, useState } from 'react'
import UserChart from '../../components/feed/user-chart'
import { useParams } from 'react-router-dom'
import UserInfo from './user-info'
import IProfileLoaderData from '../../models/pages/iprofile-data'
import '../home.css'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import { useSocket } from '../../hooks/socket-context'
import IAccountValueResponse from '../../models/dto/feed/iaccount-value-response'
import Feed from '../../components/feed/feed'

const Profile = () => {
    const [profileData, setProfileData] = useState<IProfileLoaderData | null>(null)
    const profileDataRef = useRef(profileData)

    profileDataRef.current = profileData

    const allContentLoaded = useRef(false)
    const loadingContent = useRef(false)
    const [currentPage, setCurrentPage] = useState(1)

    const { discordUsername } = useParams()
    const { getProfileData, getChart, getFeed } = useAuthenticatedApi()
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

    const loadChart = async (duration: string) => {
        const chart = await getChart(duration, discordUsername)
        setProfileData({ ...profileDataRef.current!, userChart: chart })
    }

    const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        if (allContentLoaded.current || profileData === null) return

        const target = e.target as HTMLDivElement
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 300 && !loadingContent.current) {
            loadingContent.current = true
            const feed = await getFeed(currentPage, discordUsername)
            loadingContent.current = false

            if (feed.length === 0) {
                allContentLoaded.current = true
                return
            }

            setCurrentPage(currentPage + 1)
            setProfileData({ ...profileData, feed: [ ...profileData.feed, ...feed] })
        }
    }

    useEffect(() => {
        document.title = `Stocks Competition - ${discordUsername}`

        getProfileData(discordUsername!)
            .then(response => setProfileData(response))
            .catch(err => console.error(err))
    }, [discordUsername])

    useEffect(() => {
        socket.on('account-values-update', data => onAccountValuesUpdate(JSON.parse(data)))
        return () => { socket.off('account-values-update') }
    }, [])

    return profileData === null ? <></> : (
        <div className='home-container' onScroll={onScroll}>
            <UserChart
                data={profileData.userChart}
                onDurationChange={duration => loadChart(duration)} />
            <UserInfo userInfo={profileData.userInfo} />
            <Feed posts={profileData.feed} />
        </div>
    )
}

export default Profile
