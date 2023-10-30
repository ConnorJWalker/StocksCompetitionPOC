import React, { useState } from 'react'
import IComment from '../../../models/dto/feed/icomment'
import { useUserContext } from '../../../hooks/user-context'
import CommentMenu from './comment-menu'
import CommentInput from './comment-input'
import useAuthenticatedApi from '../../../hooks/useAuthenticatedApi'
import Reactions from '../reactions'
import { Link } from 'react-router-dom'

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
            <Link to={`/profile/${comment.user.discordUsername}`}>
                <img src={process.env.REACT_APP_SERVER_URL + comment.user.profilePicture} alt={`${comment.user.displayName}'s profile picture`}/>
            </Link>
            <div className='comment-content-container'>
                <div className='comment-content'>
                    <span className='comment-header'>
                        <Link to={`/profile/${comment.user.discordUsername}`}>
                            <h4>{ comment.user.displayName }</h4>
                        </Link>
                        { (user.id === comment.user.id || user?.isAdmin) &&
                            <CommentMenu onEditClick={() => setInEditMode(!inEditMode)} onDeleteClick={onDeleteClick} /> }
                    </span>
                    {
                        inEditMode
                            ? <CommentInput onSendClick={onEditSend} onEscapeClick={() => setInEditMode(false)} value={commentBody} />
                            : commentBody
                    }
                </div>
                <Reactions id={comment.id} postType={'comment'} reactions={comment.reactions} />
            </div>
        </div>
    )
}

export default Comment
