import React, { useEffect, useState } from 'react'
import UserChart from '../../components/feed/charts/user-chart'
import { useParams } from 'react-router-dom'
import UserInfo from './user-info'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import Feed from '../../components/feed/feed'
import IFeedResponse from '../../models/dto/feed/ifeed-response'

const Profile = () => {
    const [feed, setFeed] = useState<IFeedResponse[]>([])

    const { discordUsername } = useParams()
    const { getFeed, resetPagination } = useAuthenticatedApi()

    const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = e.target as HTMLDivElement
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 300) {
            const [success, newFeed] = await getFeed({ discordUsername })
            if (success) setFeed([...feed, ...newFeed])
        }
    }

    useEffect(() => {
        document.title = `Stocks Competition - ${discordUsername}`
        getFeed({ discordUsername }).then(response => {
            if (response[0]) setFeed(response[1])
        })

        return () => resetPagination()
    }, [discordUsername])

    return (
        <div className='home-container' onScroll={onScroll}>
            <UserChart discordUsername={discordUsername} />
            <UserInfo discordUsername={discordUsername!} />
            <Feed posts={feed} />
        </div>
    )
}

export default Profile
