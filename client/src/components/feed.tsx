import React from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import IOrderHistoryResponse from '../models/dto/feed/iorder-history-response'
import formatPrice from '../utils/format-price'
import { Link } from 'react-router-dom'

dayjs.extend(relativeTime)

interface props {
    posts: IOrderHistoryResponse[]
}

const Feed = ({ posts }: props) => {
    const getPrice = (post: IOrderHistoryResponse) => {
        return post.order.price === -1
            ? 'an unknown amount of money'
            : `${formatPrice(post.order.price, post.order.instrument.currencyCode)} a share`
    }

    return (
        <div className='feed-container'>
            <h2>Feed</h2>
            {
                posts.map((post, index) => (
                    <div className='post' key={index}>
                        <header>
                            <img src={post.user.profilePicture} alt=""/>
                            <span>
                                <Link to={`/profile/${post.user.discordUsername}`}>
                                    <h3>
                                        { post.user.displayName }
                                    </h3>
                                </Link>
                                <small>{ dayjs(post.order.date).fromNow() }</small>
                            </span>
                        </header>
                        <div>
                            { post.order.type === 'buy' ? 'Bought' : 'Sold' } { post.order.quantity } shares of { post.order.instrument.name }
                            &nbsp;({ post.order.instrument.ticker }) for { getPrice(post) }
                        </div>
                        <footer>
                            <input type="text" placeholder='Comment' />
                            <span>
                                <button>
                                    <span className='like-button'>🚀</span>
                                </button>
                                <button>💥</button>
                            </span>
                        </footer>
                    </div>
                ))
            }
        </div>
    )
}

export default Feed
