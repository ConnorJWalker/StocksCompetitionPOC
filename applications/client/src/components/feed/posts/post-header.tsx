import React from 'react'
import { Link } from 'react-router-dom'
import IUser from '../../../models/iuser'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface props {
    user: IUser
    date: number
}

const PostHeader = ({ user, date }: props) => {
    return (
        <header>
            <img src={process.env.REACT_APP_SERVER_URL + user.profilePicture} alt=""/>
            <span>
                <Link to={`/profile/${user.discordUsername}`}>
                    <h3>
                        { user.displayName }
                    </h3>
                </Link>
                <small>{ dayjs(date).fromNow() }</small>
            </span>
        </header>
    )
}

export default PostHeader
