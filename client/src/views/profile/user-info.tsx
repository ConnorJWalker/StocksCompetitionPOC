import React, { useEffect, useState } from 'react'
import formatPrice from '../../utils/format-price'
import { useUserContext } from '../../hooks/user-context'
import { IProfileData } from '../../models/pages/iprofile-data'
import useLogout from '../../hooks/use-logout'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'

interface props {
    userInfo: IProfileData
}

const UserInfo = ({ userInfo }: props) => {
    const user = useUserContext()
    const logout = useLogout()
    const { sendFollowRequest, getIsUserFollowing } = useAuthenticatedApi()

    const [isFollowing, setIsFollowing] = useState<boolean | null>(null)

    useEffect(() => {
        getIsUserFollowing(userInfo.profileUser.discordUsername)
            .then(response => setIsFollowing(response))
    }, [])

    const toggleFollow = async () => {
        await sendFollowRequest(userInfo.profileUser.discordUsername)
        setIsFollowing(!isFollowing)
    }

    const renderActionButton = () => {
        if (user.discordUsername === userInfo.profileUser.discordUsername) {
            return <button className='btn-danger profile-action-button' onClick={logout}>Log Out</button>
        }

        return (
            <button
                className='btn-action profile-action-button'
                onClick={toggleFollow}
                disabled={isFollowing === null}
            >
                { isFollowing ? 'Follow' : 'Unfollow' }
            </button>
        )
    }

    return (
        <div className='leaderboards-container user-info'>
            <div>
                <div>
                    <img
                        src={userInfo.profileUser.profilePicture}
                        alt={`${userInfo.profileUser.displayName}'s profile picture`}
                        className='profile-picture' />
                    <span>
                        <h2>{userInfo.profileUser.displayName}</h2>
                        <p>{userInfo.profileUser.discordUsername}</p>
                    </span>
                </div>

                { renderActionButton() }

                <h2>Leaderboard Position</h2>
                <div className='account-value-container'>
                    <p>{ userInfo.accountValue.position } Place:</p>
                    <p>£{userInfo.accountValue.value?.values.total}</p>
                </div>

                <h2>Open Positions</h2>
                {
                    userInfo.openPositions.map((position, index) => (
                        <div key={index} className='open-position-container'>
                            <header>
                                <object data={position.instrument.icon} type='image/png'>
                                    <div>
                                        { position.instrument.ticker }
                                    </div>
                                </object>
                                <p>{ position.instrument.name }</p>
                            </header>
                            <div className='about-open-position'>
                                <p>Quantity - { position.quantity }</p>
                                <p>Average Price - { formatPrice(position.averagePrice, position.instrument.currencyCode) }</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default UserInfo
