import React from 'react'
import { Link } from 'react-router-dom'
import PostHeader from './post-header'
import IOrder from '../../../models/dto/feed/iorder'
import formatPrice from '../../../utils/format-price'
import IUser from '../../../models/iuser'
import PostFooter from './post-footer'

interface props {
    user: IUser
    id: number
    order: IOrder
}

const getPrice = (price: number, currencyCode: string) => {
    return price == -1
        ? 'an unknown amount of money'
        : `${ formatPrice(price, currencyCode) } a share`
}

const OrderPost = ({ user, id, order }: props) => {
    return (
        <div className='post'>
            <PostHeader user={user} date={order.date} />
            <div>
                { order.type === 'buy' ? 'Bought' : 'Sold' } { order.quantity } shares of <Link to={`/instrument/${order.instrument.id}`}>
                { order.instrument.name } ({ order.instrument.ticker })</Link> for { getPrice(order.price, order.instrument.currencyCode) }
            </div>
            <PostFooter
                id={id}
                postType='order'
                reactions={order.reactions}
                comments={order.comments}
                serverCommentCount={order.commentCount} />
        </div>
    )
}

export default OrderPost
