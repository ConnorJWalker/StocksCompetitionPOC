import React, { useEffect, useState } from 'react'
import Leaderboards from '../components/leaderboards'
import UserChart from '../components/feed/user-chart'
import Feed from '../components/feed/feed'
import useAuthenticatedApi from '../hooks/useAuthenticatedApi'
import './home.css'
import IFeedResponse from '../models/dto/feed/ifeed-response'


const Home = () => {
    const [feed, setFeed] = useState<IFeedResponse[]>([])

    const { getFeed, resetPagination } = useAuthenticatedApi()

    const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = e.target as HTMLDivElement
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 300) {
            const [success, newFeed] = await getFeed()
            if (success) setFeed([...feed, ...newFeed])
        }
    }

    useEffect(() => {
        document.title = 'Stocks Competition - Home'
        getFeed().then(response => {
            if (response[0]) setFeed(response[1])
        })

        return () => resetPagination()
    }, [])

    return (
        <div className='home-container' onScroll={onScroll}>
            <UserChart />
            <Leaderboards controller='feed' />
            <Feed posts={feed} />
        </div>
    )
}

export default Home
