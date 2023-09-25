import React from 'react'
import Leaderboards from './leaderboards'
import UserChart from '../../components/user-chart'
import Feed from '../../components/feed'
import { useLoaderData } from 'react-router-dom'
import { IHomeData } from '../../loaders/home-loader'
import '../home.css'

const Home = () => {
    const homeData = useLoaderData() as IHomeData

    return (
        <div className='home-container'>
            <UserChart data={homeData.chart} />
            <Leaderboards data={homeData.leaderboards} />
            <Feed posts={homeData.feed} />
        </div>
    )
}

export default Home
