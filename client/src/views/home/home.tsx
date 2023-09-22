import React from 'react'
import { useUserContext } from '../../context'
import Leaderboards from './components/leaderboards'
import './home.css'

const Home = () => {
    const user = useUserContext()

    return (
        <>
            <div className='chart-leaderboards-container'>
                {/* TODO: replace with actual graph */}
                <div className='chart'>
                    <p>Chart</p>
                </div>

                <Leaderboards />
            </div>
        </>
    )
}

export default Home
