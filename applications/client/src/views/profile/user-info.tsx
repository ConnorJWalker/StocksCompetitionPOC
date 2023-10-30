import React, { useEffect, useState } from 'react'
import formatPrice from '../../utils/format-price'
import { useUserContext } from '../../hooks/user-context'
import IProfileData from '../../models/pages/iprofile-data'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'
import { useSocket } from '../../hooks/socket-context'
import IAccountValueResponse from '../../models/dto/feed/iaccount-value-response'
import { useNavigate } from 'react-router-dom'

interface props {
    discordUsername: string
}

const UserInfo = ({ discordUsername }: props) => {
    const user = useUserContext()
    const socket = useSocket()
    const navigate = useNavigate()
    const { getUserInfo, sendFollowRequest } = useAuthenticatedApi()

    const [userInfo, setUserInfo] = useState<IProfileData>()

    const toggleFollow = async () => {
        await sendFollowRequest(discordUsername)

        if (userInfo !== undefined) {
            setUserInfo({ ...userInfo, isFollowing: !userInfo.isFollowing })
        }
    }

    const onAccountValuesUpdate = (updatedValues: IAccountValueResponse[]) => {
        if (userInfo === undefined) return

        const userValue = updatedValues.find(value => value.user.discordUsername === discordUsername)
        if (userValue === undefined) return

        setUserInfo({ ...userInfo, accountValue: {
            ...userInfo.accountValue,
            value: userValue
        } })
    }

    useEffect(() => {
        socket.on('account-values-update', data => onAccountValuesUpdate(JSON.parse(data)))
        return () => { socket.off('account-values-update') }
    }, [])

    useEffect(() => {
        getUserInfo(discordUsername).then(response => setUserInfo(response))
    }, [discordUsername])

    const renderActionButton = () => {
        if (user.discordUsername === userInfo?.accountValue.value.user.discordUsername) {
            return <button className='btn-action profile-action-button' onClick={() => navigate('/settings')}>Settings</button>
        }

        return (
            <button
                className='btn-action profile-action-button'
                onClick={toggleFollow}
                disabled={userInfo?.isFollowing === undefined}
            >
                { userInfo?.isFollowing ? 'Unfollow' : 'Follow' }
            </button>
        )
    }

    return (
        <div className='leaderboards-container user-info'>
            <div>
                <div>
                    <img
                        src={process.env.REACT_APP_SERVER_URL! + userInfo?.accountValue.value.user.profilePicture}
                        alt={`${userInfo?.accountValue.value.user.displayName}'s profile picture`}
                        className='profile-picture' />
                    <span>
                        <h2>{userInfo?.accountValue.value.user.displayName}</h2>
                        <p>{userInfo?.accountValue.value.user.discordUsername}</p>
                    </span>
                </div>

                { renderActionButton() }

                <h2>Leaderboard Position</h2>
                <div className='account-value-container'>
                    <p>{ userInfo?.accountValue.position } Place:</p>
                    <p>£{ userInfo?.accountValue.value.values.total }</p>
                </div>

                <h2>Open Positions</h2>
                {
                    userInfo?.openPositions.map((position, index) => (
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
