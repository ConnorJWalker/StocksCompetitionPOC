import React from 'react'
import IUser from '../../../models/iuser'
import IDisqualification from '../../../models/dto/feed/idisqualification'
import PostHeader from './post-header'
import PostFooter from './post-footer'

interface props {
    user: IUser
    id: number
    disqualification: IDisqualification
}

const DisqualificationPost = ({ user, id, disqualification }: props) => {
    return (
        <div className='post'>
            <PostHeader user={user} date={disqualification.date} />
            <div className='disqualified'>
                <span>🚨🚨🚨</span>
                <p>Disqualified</p>
                <span>🚨🚨🚨</span>
            </div>
            <PostFooter
                id={id}
                postType='disqualification'
                reactions={disqualification.reactions}
                comments={disqualification.comments}
                serverCommentCount={disqualification.commentCount} />
        </div>
    )
}

export default DisqualificationPost
