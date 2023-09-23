import React, { useEffect, useState } from 'react'
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
import { IAccountValuesResponse } from '../../../models/dto/feed/i-account-value-response'
import ApiService from '../../../services/api-service'

ChartJs.register(Legend, CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const UserChart = () => {
    const [data, setData] = useState<ChartData<'line'>>({datasets: []})
    const options = {
        responsive: true,
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

    useEffect(() => {
        ApiService.GetUserCharts()
            .then(response => mapResponse(response.content))
            .catch(err => console.error(err))
    }, [])

    return (
        <Line data={data} options={options} />
    )

    function mapResponse(response: IAccountValuesResponse[]) {
        let highestCount = 0
        response.forEach(value => highestCount = Math.max(highestCount, value.values.length))

        const datasets = response.map(value => ({
            label: value.user.displayName,
            data: new Array(highestCount - value.values.length).fill(null)
                .concat(value.values.map(point => point.total)),
            borderColor: value.user.displayColour,
            backgroundColor: value.user.displayColour,
            pointRadius: 0
        }))

        setData({
            datasets,
            labels: new Array(highestCount).fill('')
        })
    }
}

export default UserChart
