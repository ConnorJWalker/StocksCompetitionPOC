import React from 'react'
import Leaderboards from './components/leaderboards'
import UserChart from './components/user-chart'
import './home.css'

const Home = () => {
    return (
        <>
            <div className='chart-leaderboards-container'>
                <UserChart />
                <Leaderboards />
            </div>
        </>
    )
}

export default Home
