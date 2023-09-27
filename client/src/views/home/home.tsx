import React, { useEffect, useRef, useState } from 'react'
import Leaderboards from './leaderboards'
import UserChart from '../../components/user-chart'
import Feed from '../../components/feed'
import IHomeData from '../../models/pages/ihome-data'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import '../home.css'

const Home = () => {
    const apiCallsCount = useRef(0)
    const [homeData, setHomeData] = useState<IHomeData | null>(null)
    const { getHomeData } = useAuthenticatedApi()

    useEffect(() => {
        if (apiCallsCount.current === 0) {
            apiCallsCount.current += 1

            getHomeData()
                .then(data => setHomeData(data))
                .catch(err => console.error(err))
        }
    }, [])

    return homeData === null ? <></> : (
        <div className='home-container'>
            <UserChart data={homeData.chart} />
            <Leaderboards data={homeData.leaderboards} />
            <Feed posts={homeData.feed} />
        </div>
    )
}

export default Home
