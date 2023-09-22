import React from 'react'
import { useUserContext } from '../context'
import HomeIcon from '../components/icons/home-icon'
import PeopleIcon from '../components/icons/people-icon'
import SearchIcon from '../components/icons/search-icon'
import { useNavigate } from 'react-router-dom'

interface props {
    children: React.ReactNode
    tabIndex: number
}

const Container = ({ children, tabIndex }: props) => {
    const user = useUserContext()
    const navigate = useNavigate()

    return (
        <div className='container'>
            <main>
                { children }
            </main>
            <nav style={{ backgroundColor: user.displayColour }}>
                <span className={tabIndex === 0 ? 'selected' : ''} onClick={() => navigate('/')}>
                    <HomeIcon />
                </span>
                <span className={tabIndex === 1 ? 'selected' : ''} onClick={() => navigate('/following')}>
                    <PeopleIcon />
                </span>
                <span className={tabIndex === 2 ? 'selected' : ''} onClick={() => navigate('/search')}>
                    <SearchIcon />
                </span>

                <span className={tabIndex === 3 ? 'selected' : ''}>
                    <img src={user.profilePicture} alt='User Profile Picture' onClick={() => navigate('/profile')} />
                </span>
            </nav>
        </div>
    )
}

export default Container
