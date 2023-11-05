import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { ChartData } from 'chart.js'
import useAuthenticatedApi from '../../../hooks/useAuthenticatedApi'
import DurationSelector from './duration-selector'

interface props {
    id: number
}

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
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
                callback: (value: any) => '£' + Math.floor(value)
            }
        }
    },
    interaction: {
        mode: 'nearest' as 'nearest',
        intersect: false
    }
}

const durations = ['day', 'week', 'month', 'year', 'max']

const InstrumentChart = ({ id }: props) => {
    const [mappedData, setMappedData] = useState<ChartData<'line'>>({ datasets: [], labels: [] })
    const [duration, setDuration] = useState<string>('day')

    const { getInstrumentChart } = useAuthenticatedApi()

    const mapResponse = (values: number[]): ChartData<'line'> => {
        let colour = '#888'
        if (values[0] > values[values.length - 1]) {
            colour = '#d13232'
        }
        else if (values[0] < values[values.length - 1]) {
            colour = '#38d667'
        }

        return {
            datasets: [{
                data: values,
                borderColor: colour,
                backgroundColor: colour,
                pointRadius: 0
            }],
            labels: new Array(values.length).fill('')
        }
    }

    useEffect(() => {
        getInstrumentChart(id, duration)
            .then(response => setMappedData(mapResponse(response)))
    }, [duration])

    return (
        <>
            <div className='chart'>
                <Line data={mappedData} options={options} />
            </div>
            <div className='chart-options-container'>
                <DurationSelector
                    durations={durations}
                    onChange={selectedDuration => setDuration(selectedDuration)} />
            </div>
        </>
    )
}

export default InstrumentChart
