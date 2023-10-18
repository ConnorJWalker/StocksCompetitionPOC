import React, { useState } from 'react'
import SendIcon from '../../icons/send-icon'

interface props {
    value?: string
    onSendClick: (content: string) => Promise<void>
    onEscapeClick?: () => void
}

const CommentInput = ({ onSendClick, onEscapeClick, value }: props) => {
    const [commentInput, setCommentInput] = useState(value || '')
    const [showSendButton, setShowSendButton] = useState(false)

    const onSendOrEnterClick = async () => {
        const trimmed = commentInput.trim()
        if (trimmed.length >= 3 && trimmed.length < 128) {
            await onSendClick(commentInput)
        }

        setCommentInput('')
    }

    const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key.toLowerCase() === 'enter') {
            await onSendOrEnterClick()
        }
        else if (e.key.toLowerCase() === 'escape' && onEscapeClick !== undefined) {
            onEscapeClick()
        }
    }

    return (
        <span className='comment-input'>
            <input
                type='text'
                placeholder='Comment'
                value={commentInput}
                onFocus={() => setShowSendButton(true)}
                onBlur={() => setShowSendButton(false) }
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus={value !== undefined} />
            <button
                disabled={commentInput.trim().length < 3 || commentInput.trim().length > 128}
                style={{ display: showSendButton || commentInput.trim().length > 1 ? '' : 'none' }}
                onClick={onSendOrEnterClick}
            >
                <SendIcon />
            </button>
        </span>
    )
}

export default CommentInput
