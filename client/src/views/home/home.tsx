import React, { useEffect, useRef, useState } from 'react'
import Leaderboards from './leaderboards'
import UserChart from '../../components/feed/user-chart'
import Feed from '../../components/feed/feed'
import IHomeData from '../../models/pages/ihome-data'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import '../home.css'
import { useSocket } from '../../hooks/socket-context'
import IAccountValueResponse from '../../models/dto/feed/iaccount-value-response'
import orderLeaderboards from '../../utils/order-leaderboards'

const Home = () => {
    const [homeData, setHomeData] = useState<IHomeData | null>(null)
    const homeDataRef = useRef(homeData)
    const apiCallsCount = useRef(0)

    homeDataRef.current = homeData

    const { getHomeData } = useAuthenticatedApi()
    const socket = useSocket()

    const onAccountValuesUpdate = (updatedValues: IAccountValueResponse[]) => {
        if (homeDataRef.current === null) return

        const leaderboards = homeDataRef.current.leaderboards

        updatedValues.forEach(value => {
            const userIndex = leaderboards.findIndex(user => user.user.id === value.user.id)

            if (userIndex === undefined || userIndex === -1) {
                leaderboards.push(value)
                return
            }

            leaderboards[userIndex] = value
        })

        setHomeData({ ...homeDataRef.current, leaderboards: orderLeaderboards(leaderboards) })
    }

    useEffect(() => {
        if (apiCallsCount.current === 0) {
            apiCallsCount.current += 1

            getHomeData()
                .then(data => setHomeData(data))
                .catch(err => console.error(err))
        }

        socket.on('account-values-update', data => onAccountValuesUpdate(JSON.parse(data)))
        return () => { socket.off('account-values-update') }
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
