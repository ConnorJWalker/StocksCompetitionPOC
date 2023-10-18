import React, { useRef, useState } from 'react'
import useAuthenticatedApi from '../../../hooks/useAuthenticatedApi'
import IReactions from '../../../models/dto/feed/ireactions'
import IComment from '../../../models/dto/feed/icomment'
import Comment from '../comments/comment'
import SendIcon from '../../icons/send-icon'
import { useUserContext } from '../../../hooks/user-context'

interface props {
    id: number
    postType: string
    reactions: IReactions
    comments: IComment[]
    serverCommentCount: number
}

const PostFooter = ({ id, postType, reactions, comments, serverCommentCount }: props) => {
    const [commentInput, setCommentInput] = useState('')
    const [showSendButton, setShowSendButton] = useState(false)
    const [disableLoadCommentsButton, setDisableLoadCommentsButton] = useState(false)
    const [currentComments, setCurrentComments] = useState(comments)
    const [currentReactions, setCurrentReactions] = useState(reactions)

    const currentReactionsRef = useRef(reactions)
    const currentCommentsRef = useRef(comments)

    currentReactionsRef.current = currentReactions
    currentCommentsRef.current = currentComments

    const user = useUserContext()
    const { sendReaction, sendComment, getComments, deleteComment } = useAuthenticatedApi()

    const onReactionClick = async (type: number) => {
        await sendReaction(type, postType, id)
        if (currentReactionsRef.current === undefined) return

        // like button clicked
        if (type === 0) {
            // remove like
            if (currentReactionsRef.current.userHasLiked) {
                currentReactionsRef.current.userHasLiked = false
                currentReactionsRef.current.likes--
            }
            // add like
            else {
                currentReactionsRef.current.userHasLiked = true
                currentReactionsRef.current.likes++
            }

            if (currentReactionsRef.current.userHasDisliked) {
                currentReactionsRef.current.userHasDisliked = false
                currentReactionsRef.current.dislikes--
            }
        }
        // dislike button clicked
        else {
            // remove dislike
            if (currentReactionsRef.current.userHasDisliked) {
                currentReactionsRef.current.userHasDisliked = false
                currentReactionsRef.current.dislikes--
            }
            // add dislike
            else {
                currentReactionsRef.current.userHasDisliked = true
                currentReactionsRef.current.dislikes++
            }

            if (currentReactionsRef.current.userHasLiked) {
                currentReactionsRef.current.userHasLiked = false
                currentReactionsRef.current.likes--
            }
        }

        setCurrentReactions({ ...currentReactionsRef.current })
    }

    const sendCommentButtonClick = async () => {
        const commentId = await sendComment(postType, id, commentInput)
        setCurrentComments([
            {
                user,
                id: commentId,
                content: {
                    body: commentInput,
                    date: new Date(Date.now()).toUTCString()
                }
            },
            ...currentComments
        ])

        setCommentInput('')
    }

    const loadCommentsButtonClick = async () => {
        setDisableLoadCommentsButton(true)

        const comments = await getComments(postType, id, currentCommentsRef.current.length)
        setCurrentComments([ ...currentCommentsRef.current, ...comments ])

        setDisableLoadCommentsButton(false)
    }

    const deleteCommentButtonClick = async (commentId: number) => {
        await deleteComment(commentId)
        setCurrentComments(currentComments.filter(comment => comment.id !== commentId))
    }

    return (
        <footer>
            <section className='post-actions'>
                <span className='comment-input'>
                    <input
                        type='text'
                        placeholder='Comment'
                        value={commentInput}
                        onFocus={() => setShowSendButton(true)}
                        onBlur={() => setShowSendButton(false) }
                        onChange={e => setCommentInput(e.target.value)} />
                    <button
                        disabled={commentInput.trim().length < 3 || commentInput.trim().length > 128}
                        style={{ display: showSendButton || commentInput.trim().length > 1 ? '' : 'none' }}
                        onClick={sendCommentButtonClick}
                    >
                        <SendIcon />
                    </button>
                </span>
                <span>
                    <button className={`reaction-button ${currentReactions?.userHasDisliked ? 'selected' : ''}`} onClick={() => onReactionClick(1)}>
                        <span>💥</span> <small>{ currentReactions?.dislikes || 0 }</small>
                    </button>
                    <button className={`reaction-button ${currentReactions?.userHasLiked ? 'selected' : ''}`} onClick={() => onReactionClick(0)}>
                        <span>🚀</span> <small>{ currentReactions?.likes || 0 }</small>
                    </button>
                </span>
            </section>
            <section className='post-comments'>
                { currentComments.map((comment, index) =>
                    <Comment
                        comment={comment}
                        onDeleteClick={() => deleteCommentButtonClick(comment.id)}
                        key={index} />)
                }
                { (currentComments.length < serverCommentCount) &&
                    <button className='load-comments' disabled={disableLoadCommentsButton} onClick={loadCommentsButtonClick}>Load more comments</button> }
            </section>
        </footer>
    )
}

export default PostFooter
