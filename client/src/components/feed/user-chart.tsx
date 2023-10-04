import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJs,
    ChartData,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
} from 'chart.js'
import { IAccountValuesResponse } from '../../models/dto/feed/iaccount-value-response'

interface props {
    data: IAccountValuesResponse[],
    onDurationChange: (duration: string) => void
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

                    if (label) label += ': '

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

const UserChart = ({ data, onDurationChange }: props) => {
    const [duration, setDuration] = useState(0)
    const mappedData = mapResponse()

    return (
        <>
            <div className='chart'>
                <Line data={mappedData} options={options} />
            </div>
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
        </>
    )

    function mapResponse(): ChartData<'line'> {
        let highestCount = 0
        data.forEach(value => highestCount = Math.max(highestCount, value.values.length))

        const datasets = data.map(value => ({
            label: value.user.displayName,
            data: new Array(highestCount - value.values.length).fill(null)
                .concat(value.values.map(point => point.total)),
            borderColor: value.user.displayColour,
            backgroundColor: value.user.displayColour,
            pointRadius: 0
        }))

        return {
            datasets,
            labels: new Array(highestCount).fill('')
        }
    }

    function durationClick(index: number) {
        const durations = ['day', 'week', 'max']
        setDuration(index)
        onDurationChange(durations[index])
    }
}

export default UserChart
