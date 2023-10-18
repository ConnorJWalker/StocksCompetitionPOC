import React from 'react'
import IComment from '../../../models/dto/feed/icomment'
import { useUserContext } from '../../../hooks/user-context'
import CommentMenu from './comment-menu'

interface props {
    comment: IComment
    onDeleteClick: () => Promise<void>
}

const Comment = ({ comment, onDeleteClick }: props) => {
    const user = useUserContext()

    const onEditClick = async () => {

    }

    return (
        <div className='comment'>
            <img src={comment.user.profilePicture} alt={`${comment.user.displayName}'s profile picture`}/>
            <div className='comment-content-container'>
                <div className='comment-content'>
                    <span className='comment-header'>
                        <h4>{ comment.user.displayName }</h4>
                        { user.id === comment.user.id && <CommentMenu onEditClick={onEditClick} onDeleteClick={onDeleteClick} /> }
                    </span>
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
