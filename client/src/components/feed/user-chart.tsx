import React from 'react'
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

ChartJs.register(Legend, CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

interface props {
    data: IAccountValuesResponse[]
}

const UserChart = ({ data }: props) => {
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

    const mappedData = mapResponse()

    return (
        <div className='chart'>
            <Line data={mappedData} options={options} />
        </div>
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
}

export default UserChart
