import React, { useRef, useState } from 'react'
import IReactions from '../../models/dto/feed/ireactions'
import useAuthenticatedApi from '../../hooks/useAuthenticatedApi'

interface props {
    id: number
    postType: string
    reactions: IReactions
}

const Reactions = ({ id, postType, reactions }: props) => {
    const [currentReactions, setCurrentReactions] = useState(reactions)

    const currentReactionsRef = useRef(reactions)
    currentReactionsRef.current = currentReactions

    const { sendReaction } = useAuthenticatedApi()

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

    const getClassName = (isSelected: boolean) => `reaction-button ${isSelected ? 'selected' : ''}`

    return (
        <span>
            <button className={getClassName(currentReactions?.userHasDisliked)} onClick={() => onReactionClick(1)}>
                <span>💥</span> <small>{ currentReactions?.dislikes || 0 }</small>
            </button>
            <button className={getClassName(currentReactions?.userHasLiked)} onClick={() => onReactionClick(0)}>
                <span>🚀</span> <small>{ currentReactions?.likes || 0 }</small>
            </button>
        </span>
    )
}

export default Reactions
