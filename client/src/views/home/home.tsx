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

    const [currentPage, setCurrentPage] = useState(1)
    const loadingContent = useRef(false)
    const allContentLoaded = useRef(false)

    homeDataRef.current = homeData

    const { getHomeData, getChart, getFeed } = useAuthenticatedApi()
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

    const loadChart = async (duration: string) => {
        const chart = await getChart(duration)
        setHomeData({ ...homeDataRef.current!, chart })
    }

    const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        if (allContentLoaded.current || homeData === null) return

        const target = e.target as HTMLDivElement
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 300 && !loadingContent.current) {
            loadingContent.current = true
            const feed = await getFeed(currentPage)
            loadingContent.current = false

            if (feed.length === 0) {
                allContentLoaded.current = true
                return
            }

            setCurrentPage(currentPage + 1)
            setHomeData({ ...homeData, feed: [ ...homeData.feed, ...feed] })
        }
    }

    useEffect(() => {
        document.title = 'Stocks Competition - Home'

        getHomeData()
            .then(data => setHomeData(data))
            .catch(err => console.error(err))

        socket.on('account-values-update', data => onAccountValuesUpdate(JSON.parse(data)))
        return () => { socket.off('account-values-update') }
    }, [])

    return homeData === null ? <></> : (
        <div className='home-container' onScroll={onScroll}>
            <UserChart
                data={homeData.chart}
                onDurationChange={duration => loadChart(duration)} />
            <Leaderboards data={homeData.leaderboards} />
            <Feed posts={homeData.feed} />
        </div>
    )
}

export default Home
