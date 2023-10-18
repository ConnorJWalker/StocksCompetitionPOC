import React, { useState } from 'react'
import IComment from '../../../models/dto/feed/icomment'
import { useUserContext } from '../../../hooks/user-context'
import CommentMenu from './comment-menu'
import CommentInput from './comment-input'
import useAuthenticatedApi from '../../../hooks/useAuthenticatedApi'

interface props {
    comment: IComment
    onDeleteClick: () => Promise<void>
}

const Comment = ({ comment, onDeleteClick }: props) => {
    const [inEditMode, setInEditMode] = useState(false)
    const [commentBody, setCommentBody] = useState(comment.content.body)

    const { editComment } = useAuthenticatedApi()
    const user = useUserContext()

    const onEditSend = async (content: string) => {
        await editComment(comment.id, content)
        setInEditMode(false)
        setCommentBody(content)
    }

    return (
        <div className='comment'>
            <img src={comment.user.profilePicture} alt={`${comment.user.displayName}'s profile picture`}/>
            <div className='comment-content-container'>
                <div className='comment-content'>
                    <span className='comment-header'>
                        <h4>{ comment.user.displayName }</h4>
                        { user.id === comment.user.id &&
                            <CommentMenu onEditClick={() => setInEditMode(!inEditMode)} onDeleteClick={onDeleteClick} /> }
                    </span>
                    {
                        inEditMode
                            ? <CommentInput onSendClick={onEditSend} onEscapeClick={() => setInEditMode(false)} value={commentBody} />
                            : commentBody
                    }
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
