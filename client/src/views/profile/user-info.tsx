import React, { useEffect, useState } from 'react'
import IUser from '../../models/iuser'
import ApiService from '../../services/api-service'
import IAccountValueResponse from '../../models/dto/feed/i-account-value-response'
import IOpenPositionsResponse from '../../models/dto/profile/iopen-positions-response'
import formatPrice from '../../utils/format-price'
import { useUserContext } from '../../context'
import AuthenticationService from '../../services/authentication-service'

interface props {
    discordUsername?: string
}

const UserInfo = ({ discordUsername }: props) => {
    const user = useUserContext()
    const [profileUser, setProfileUser] = useState<IUser | null>(null)
    const [accountValues, setAccountValues] = useState<IAccountValueResponse[]>([])
    const [openPositions, setOpenPositions] = useState<IOpenPositionsResponse[]>([])

    useEffect(() => {
        ApiService.GetProfileUser(discordUsername!)
            .then(response => setProfileUser(response))
            .catch(err => console.log(err))

        ApiService.GetLeaderboards()
            .then(response => setAccountValues(response.content))
            .catch(err => console.log(err))

        ApiService.GetOpenPositions(discordUsername!)
            .then(response => setOpenPositions(response))
            .catch(err => console.log(err))
    }, [])

    return (
        <div className='leaderboards-container user-info'>
            <div>
                <div>
                    <img
                        src={profileUser?.profilePicture}
                        alt={`${discordUsername}'s profile picture`}
                        className='profile-picture' />
                    <span>
                        <h2>{profileUser?.displayName}</h2>
                        <p>{profileUser?.discordUsername}</p>
                    </span>
                </div>

                {
                    user.discordUsername === discordUsername
                        ? <button className='btn-danger profile-action-button' onClick={AuthenticationService.LogOut}>Log Out</button>
                        : <button className='btn-pink profile-action-button'>Follow</button>
                }

                { renderAccountValue() }

                <h2>Open Positions</h2>
                {
                    openPositions.map(position => (
                        <div className='open-position-container'>
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

    function renderAccountValue() {
        const userValue = accountValues.find(value => value.user.discordUsername === discordUsername)
        const position = accountValues.findIndex(value => value.user.discordUsername === discordUsername)
        const positionSuffix = (position: number) => {
            const endCharacter = position.toString().split('').pop()

            if (endCharacter === '1') return 'st'
            else if (endCharacter === '2') return 'nd'
            else if (endCharacter === '3') return 'rd'
            else return 'th'
        }

        return (
            <>
                <h2>Leaderboard Position</h2>
                <div className='account-value-container'>
                    <p>{position + 1}{positionSuffix(position + 1)} Place:</p>
                    <p>£{userValue?.values.total}</p>
                </div>
            </>
        )
    }
}

export default UserInfo
