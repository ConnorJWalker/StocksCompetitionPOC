import React from 'react'

const PostFooter = () => {
    return (
        <footer>
            <input type='text' placeholder='Comment' />
            <span>
                <button>
                    <span className='like-button'>🚀</span>
                </button>
                <button>💥</button>
            </span>
        </footer>
    )
}

export default PostFooter
