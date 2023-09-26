import React, { useEffect, useState } from 'react'
import Leaderboards from './leaderboards'
import UserChart from '../../components/user-chart'
import Feed from '../../components/feed'
import homeLoader, { IHomeData } from '../../loaders/home-loader'
import '../home.css'

const Home = () => {
    const [homeData, setHomeData] = useState<IHomeData | null>(null)

    useEffect(() => {
        homeLoader()
            .then(data => setHomeData(data))
            .catch(err => console.error(err))
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
