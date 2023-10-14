import React from 'react'
import PostHeader from './post-header'
import IOrder from '../../../models/dto/feed/iorder'
import formatPrice from '../../../utils/format-price'
import IUser from '../../../models/iuser'
import PostFooter from './post-footer'

interface props {
    user: IUser
    order: IOrder
}

const getPrice = (price: number, currencyCode: string) => {
    return price === -1
        ? 'an unknown amount of money'
        : `${ formatPrice(price, currencyCode) } a share`
}

const OrderPost = ({ user, order }: props) => {
    return (
        <div className='post'>
            <PostHeader user={user} date={order.date} />
            <div>
                { order.type === 'buy' ? 'Bought' : 'Sold' } { order.quantity } shares of { order.instrument.name }
                &nbsp;({ order.instrument.ticker }) for { getPrice(order.price, order.instrument.currencyCode) }
            </div>
            <PostFooter />
        </div>
    )
}

export default OrderPost
