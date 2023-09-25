import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ApiService from '../services/api-service'
import IOrderHistoryResponse from '../models/dto/feed/iorder-history-response'
import formatPrice from '../utils/format-price'
import { Link } from 'react-router-dom'

interface props {
    discordUsername?: string
}

const Feed = ({ discordUsername }: props) => {
    const [posts, setPosts] = useState<IOrderHistoryResponse[]>([])

    dayjs.extend(relativeTime)

    useEffect(() => {
        ApiService.GetFeed(discordUsername)
            .then(response => setPosts(response))
            .catch(err => console.log(err))
    }, [])

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
                            &nbsp;({ post.order.instrument.ticker }) for { formatPrice(post.order.price, post.order.instrument.currencyCode) }
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
