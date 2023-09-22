import React from 'react'
import { useUserContext } from '../../context'
import Leaderboards from './components/leaderboards'
import './home.css'

const Home = () => {
    const user = useUserContext()

    return (
        <>
            <h1>Stocks Competition</h1>
            {/* TODO: replace with actual graph */}
            <div style={{ backgroundColor: 'red', width: '100%', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p>Chart</p>
            </div>

            <Leaderboards />
        </>
    )
}

export default Home
