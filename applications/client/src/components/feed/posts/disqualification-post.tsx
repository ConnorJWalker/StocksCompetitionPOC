import React from 'react'
import IUser from '../../../models/iuser'
import IDisqualification from '../../../models/dto/feed/idisqualification'
import PostHeader from './post-header'
import PostFooter from './post-footer'

interface props {
    user: IUser
    disqualification: IDisqualification
}

const DisqualificationPost = ({ user, disqualification }: props) => {
    return (
        <div className='post'>
            <PostHeader user={user} date={disqualification.date} />
            <div className='disqualified'>
                <span>🚨🚨🚨</span>
                <p>Disqualified</p>
                <span>🚨🚨🚨</span>
            </div>
            <PostFooter />
        </div>
    )
}

export default DisqualificationPost
