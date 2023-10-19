import React, { useState } from 'react'
import useAuthenticatedApi from '../../../hooks/useAuthenticatedApi'
import IReactions from '../../../models/dto/feed/ireactions'
import IComment from '../../../models/dto/feed/icomment'
import Comment from '../comments/comment'
import { useUserContext } from '../../../hooks/user-context'
import CommentInput from '../comments/comment-input'
import Reactions from '../reactions'

interface props {
    id: number
    postType: string
    reactions: IReactions
    comments: IComment[]
    serverCommentCount: number
}

const PostFooter = ({ id, postType, reactions, comments, serverCommentCount }: props) => {
    const [disableLoadCommentsButton, setDisableLoadCommentsButton] = useState(false)
    const [currentComments, setCurrentComments] = useState(comments)

    const user = useUserContext()
    const { sendComment, getComments, deleteComment } = useAuthenticatedApi()

    const sendCommentButtonClick = async (content: string) => {
        const commentId = await sendComment(postType, id, content)
        setCurrentComments([
            {
                user,
                id: commentId,
                content: {
                    body: content,
                    date: new Date(Date.now()).toUTCString()
                },
                reactions: { likes: 0, dislikes: 0, userHasLiked: false, userHasDisliked: false }
            },
            ...currentComments
        ])
    }

    const loadCommentsButtonClick = async () => {
        setDisableLoadCommentsButton(true)

        const comments = await getComments(postType, id, currentComments.length)
        setCurrentComments([ ...currentComments, ...comments ])

        setDisableLoadCommentsButton(false)
    }

    const deleteCommentButtonClick = async (commentId: number) => {
        await deleteComment(commentId)
        setCurrentComments(currentComments.filter(comment => comment.id !== commentId))
    }

    return (
        <footer>
            <section className='post-actions'>
                <CommentInput onSendClick={sendCommentButtonClick} />
                <Reactions id={id} postType={postType} reactions={reactions} />
            </section>
            <section className='post-comments'>
                { currentComments.map(comment =>
                    <Comment
                        comment={comment}
                        onDeleteClick={() => deleteCommentButtonClick(comment.id)}
                        key={comment.id} />)
                }
                { (currentComments.length < serverCommentCount) &&
                    <button className='load-comments' disabled={disableLoadCommentsButton} onClick={loadCommentsButtonClick}>Load more comments</button> }
            </section>
        </footer>
    )
}

export default PostFooter
