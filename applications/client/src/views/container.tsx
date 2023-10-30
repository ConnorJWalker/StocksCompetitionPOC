import React from 'react'
import { useUserContext } from '../hooks/user-context'
import HomeIcon from '../components/icons/home-icon'
import PeopleIcon from '../components/icons/people-icon'
import SearchIcon from '../components/icons/search-icon'
import { useLocation, useNavigate } from 'react-router-dom'

interface props {
    children: React.ReactNode
}

const Container = ({ children }: props) => {
    const user = useUserContext()
    const navigate = useNavigate()

    const { pathname } = useLocation()

    return (
        <div className='container'>
            <main>
                { children }
            </main>
            <nav>
                <span className={pathname === '/' ? 'selected' : ''} onClick={() => navigate('/')}>
                    <HomeIcon />
                </span>
                <span className={pathname === '/following' ? 'selected' : ''} onClick={() => navigate('/following')}>
                    <PeopleIcon />
                </span>
                <span className={pathname === '/search' ? 'selected' : ''} onClick={() => navigate('/search')}>
                    <SearchIcon />
                </span>

                <div className='spacer'></div>

                <span className={pathname === `/profile/${user.discordUsername}` ? 'selected' : ''}>
                    <img src={process.env.REACT_APP_SERVER_URL + user.profilePicture} alt='User Profile Picture' onClick={() => navigate(`/profile/${user.discordUsername}`)} />
                </span>
            </nav>
        </div>
    )
}

export default Container
