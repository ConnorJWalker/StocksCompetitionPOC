import React from 'react'
import Leaderboards from './components/leaderboards'
import UserChart from './components/user-chart'
import Feed from './components/feed'
import './home.css'

const Home = () => {
    return (
        <div className='home-container'>
            <UserChart />
            <Leaderboards />
            <Feed />
        </div>
    )
}

export default Home
