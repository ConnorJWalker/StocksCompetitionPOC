import React, { useEffect, useState } from 'react'
import IFeedResponse from '../models/dto/feed/ifeed-response'
import useAuthenticatedApi from '../hooks/useAuthenticatedApi'
import UserChart from '../components/feed/charts/user-chart'
import Leaderboards from '../components/feed/leaderboards'
import Feed from '../components/feed/feed'

const Following = () => {
    const [feed, setFeed] = useState<IFeedResponse[]>([])

    const { getFeed, resetPagination } = useAuthenticatedApi()

    const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = e.target as HTMLDivElement
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 300) {
            const [success, newFeed] = await getFeed({ followingOnly: true })
            if (success) setFeed([...feed, ...newFeed])
        }
    }

    useEffect(() => {
        document.title = 'Stocks Competition - Following'
        getFeed({ followingOnly: true }).then(response => {
            if (response[0]) setFeed(response[1])
        })

        return () => resetPagination()
    }, [])

    return (
        <div className='home-container' onScroll={onScroll}>
            <UserChart followingOnly={true} />
            <Leaderboards controller='following' />
            <Feed posts={feed} />
        </div>
    )
}

export default Following
