import React, { useState } from 'react'
import IInstrument from '../models/iintrument'
import useAuthenticatedApi from '../hooks/useAuthenticatedApi'
import InstrumentIcon from '../components/instrument-icon'

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<IInstrument[]>([])

    const { searchInstruments } = useAuthenticatedApi()

    const onSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)

        if (value.trim().length === 0) return

        const searchResults = await searchInstruments(value)
        setResults([...searchResults])
    }

    return (
        <div className='search-container'>
            <input
                type="search"
                placeholder="Search Instruments"
                value={searchTerm}
                onChange={onSearchChange} />

            <div className='search-results-container'>
                { results.map(result => (
                    <div className='search-result'>
                        <InstrumentIcon url={result.icon} ticker={result.ticker} />
                        <div>
                            <h3>{ result.name }</h3>
                            <p>{ result.ticker }</p>
                        </div>
                    </div>
                )) }
            </div>
        </div>
    )
}

export default Search
