import React from 'react'
import IComment from '../../models/dto/feed/icomment'

interface props {
    comment: IComment
}

const Comment = ({ comment }: props) => {
    return (
        <div className='comment'>
            <img src={comment.user.profilePicture} alt={`${comment.user.displayName}'s profile picture`}/>
            <div className='comment-content-container'>
                <div className='comment-content'>
                    <h4>{ comment.user.displayName }</h4>
                    { comment.content.body }
                </div>
                <span>
                    <button className={`reaction-button`}>
                        <span>💥</span> <small>0</small>
                    </button>
                    <button className={`reaction-button`}>
                        <span>🚀</span> <small>0</small>
                    </button>
                </span>
            </div>
        </div>
    )
}

export default Comment
