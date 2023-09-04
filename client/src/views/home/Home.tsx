import React from 'react'
import { useUserContext } from '../../context'

const Home = () => {
    const user = useUserContext()

    return (
        <h1>Home Feed - { user.displayName }</h1>
    )
}

export default Home
