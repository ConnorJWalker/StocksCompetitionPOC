import React, { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJs,
    ChartData,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip, Point
} from 'chart.js'
import { IAccountValuesResponse } from '../../models/dto/feed/iaccount-value-response'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import { useSocket } from '../../hooks/socket-context'
import IAccountValueUpdate from '../../models/dto/iaccount-value-update'
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types'
import ExpandIcon from '../icons/expand-icon'

interface props {
    controller?: string,
    discordUsername?: string
    followingOnly?: boolean
}

ChartJs.register(Legend, CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    let label = context.dataset.label || ''

                    if (label) {
                        label = label.split(':')[1]
                        label += ': '
                    }

                    if (context.parsed.y !== null)
                        label += new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(context.parsed.y)

                    return label
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            }
        },
        y: {
            ticks: {
                callback: (value: any) => '£' + value
            }
        }
    },
    interaction: {
        mode: 'nearest' as 'nearest',
        intersect: false
    }
}

const durations = ['day', 'week', 'max']

const UserChart = ({ discordUsername, followingOnly }: props) => {
    const currentHour = useRef(new Date(Date.now()).getHours())

    const [duration, setDuration] = useState(0)
    const durationRef = useRef(0)
    const [mappedData, setMappedData] = useState<ChartData<'line'>>({ datasets: [], labels: [] })
    const mappedDataRef = useRef<ChartData<'line'>>({ datasets: [], labels: [] })

    const socket = useSocket()
    const { getChart } = useAuthenticatedApi()

    mappedDataRef.current = mappedData
    durationRef.current = duration

    let chartReference = useRef<ChartJSOrUndefined<"line", (number | Point | null)[], unknown> | null>(null)

    const durationClick = async (index: number) => {
        const response = await getChart(durations[index], { discordUsername, followingOnly })

        setDuration(index)
        setMappedData(mapResponse(response))
    }

    const mapResponse = (values: IAccountValuesResponse[]): ChartData<'line'> => {
        let newHighestCount = 0
        values.forEach(value => newHighestCount = Math.max(newHighestCount, value.values.length))

        const datasets = values.map(value => ({
            label: `${value.user.discordUsername}:${value.user.displayName}`,
            data: new Array(newHighestCount - value.values.length).fill(null)
                .concat(value.values.map(point => point.total)),
            borderColor: value.user.displayColour,
            backgroundColor: value.user.displayColour,
            pointRadius: 0
        }))

        return {
            datasets,
            labels: new Array(newHighestCount).fill('')
        }
    }

    const onAccountValuesUpdate = (updatedValues: IAccountValueUpdate) => {
        const newCurrentHour = new Date(Date.now()).getHours()
        const handledUsers = new Set<string>()
        const newValues = mappedDataRef.current
        const appendNewValues = updatedValues.savedToDatabase && (durationRef.current === 0 || currentHour.current < newCurrentHour)

        updatedValues.values.forEach(value => {
            const datasetIndex = mappedDataRef.current.datasets.findIndex(dataset => {
                return dataset.label?.split(':')[0] === value.user.discordUsername
            })

            if (datasetIndex === -1 && !followingOnly) {
                newValues.datasets.push({
                    label: `${value.user.discordUsername}:${value.user.displayName}`,
                    data: new Array(newValues.labels!.length - 1).fill(null)
                        .concat(value.values.total),
                    borderColor: value.user.displayColour,
                    backgroundColor: value.user.displayColour,
                    pointRadius: 0
                })

                return
            }

            if (datasetIndex === -1) return

            if (appendNewValues) {
                handledUsers.add(value.user.discordUsername)
                newValues.datasets[datasetIndex].data.push(value.values.total)
                return
            }

            const lastElement = newValues.datasets[datasetIndex].data.length - 1
            newValues.datasets[datasetIndex].data[lastElement] = value.values.total
        })

        // Add extra index to the rest of the users who did not get a new value from socket message
        if (appendNewValues) {
            newValues.labels?.push('')
            currentHour.current = newCurrentHour

            newValues.datasets.forEach((value, index) => {
                const discordUsername = value.label?.split(':')[0]
                if (discordUsername === undefined || handledUsers.has(discordUsername)) return

                const lastElement = value.data.length - 1
                newValues.datasets[index].data.push(value.data[lastElement])
            })
        }

        chartReference.current?.update()
        setMappedData({ ...newValues })
    }

    const onFullscreenClick = async () => {
        await document.querySelector('.chart')?.requestFullscreen()
    }

    useEffect(() => {
        getChart(durations[0], { discordUsername, followingOnly })
            .then(response => setMappedData(mapResponse(response)))

            socket.on('account-values-update', data => onAccountValuesUpdate(JSON.parse(data)))
            return () => { socket.off('account-values-update') }
    }, [])

    return (
        <>
            <div className='chart'>
                <Line data={mappedData} options={options} ref={(reference) => chartReference.current = reference} />
            </div>
            <div className='chart-options-container'>
                <span className='chart-duration-container'>
                    <span
                        className={duration === 0 ? 'selected' : ''}
                        onClick={() => durationClick(0)}
                    >
                        Day
                    </span>
                    <span
                        className={duration === 1 ? 'selected' : ''}
                        onClick={() => durationClick(1)}
                    >
                        Week
                    </span>
                    <span
                        className={duration === 2 ? 'selected' : ''}
                        onClick={() => durationClick(2)}
                    >
                        Max
                    </span>
                </span>

                <span className='expand' onClick={onFullscreenClick}>
                    <ExpandIcon />
                </span>
            </div>
        </>
    )
}

export default UserChart
