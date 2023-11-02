import React, { useEffect, useState } from 'react'
import IInstrument from '../models/iintrument'
import useAuthenticatedApi from '../hooks/useAuthenticatedApi'
import InstrumentIcon from '../components/instrument-icon'

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<IInstrument[]>([])

    const { searchInstruments, resetPagination } = useAuthenticatedApi()

    useEffect(() => {
        document.title = 'Stocks Competition - Search'
        return () => resetPagination()
    }, [])

    const onSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        resetPagination()
        const value = e.target.value
        setSearchTerm(value)

        if (value.trim().length === 0) return

        const [success, searchResults] = await searchInstruments(value)
        if (success) {
            setResults([...searchResults])
        }
    }

    const onScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = e.target as HTMLDivElement
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 300) {
            const [success, searchResults] = await searchInstruments(searchTerm, true)
            if (success) {
                setResults([...results, ...searchResults])
            }
        }
    }

    return (
        <div className='search-container' onScroll={onScroll}>
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
