import React from 'react'
import IOrder from '../../models/dto/feed/iorder'
import IFeedResponse from '../../models/dto/feed/ifeed-response'
import OrderPost from './posts/order-post'
import DisqualificationPost from './posts/disqualification-post'
import IDisqualification from '../../models/dto/feed/idisqualification'


interface props {
    posts: IFeedResponse[]
}

const Feed = ({ posts }: props) => {
    return (
        <div className='feed-container'>
            <h2>Feed</h2>
            {
                posts.map((post, index) => {
                    switch (post.type) {
                        case 'order':
                            return <OrderPost user={post.user} order={post.content as IOrder} key={index} />
                        case 'disqualification':
                            return <DisqualificationPost user={post.user} disqualification={post.content as IDisqualification} key={index} />
                    }
                })
            }
        </div>
    )
}

export default Feed
