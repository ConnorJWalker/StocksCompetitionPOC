import React, { useEffect, useState } from 'react'
import ApiService from '../../../services/api-service'
import IOrderHistoryResponse from '../../../models/dto/feed/iorder-history-response'

const Feed = () => {
    const [posts, setPosts] = useState<IOrderHistoryResponse[]>([])

    useEffect(() => {
        ApiService.GetFeed()
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
                                <h3>{ post.user.displayName }</h3>
                                <small>{ Date.now() }</small>
                            </span>
                        </header>
                        <div>
                            { post.order.type === 'buy' ? 'Bought' : 'Sold' } { post.order.quantity } shares of { post.order.instrument.name }
                            &nbsp;({ post.order.instrument.ticker }) for { formatPrice(post.order.price, post.order.instrument.currencyCode) }
                        </div>
                        <footer>
                            <button>
                                <span className='like-button'>🚀</span>
                            </button>
                            <button>💥</button>
                        </footer>
                    </div>
                ))
            }
        </div>
    )

    function formatPrice(price: number, currencyCode: string): string  {
        switch (currencyCode) {
            case 'USD': return '$' + price
            case 'EUR': return '€' + price
            case 'GBP': return '£' + price
            case 'GBX': return price + 'p'
            default: return price + currencyCode
        }
    }
}

export default Feed
