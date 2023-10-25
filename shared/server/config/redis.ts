import { createClient } from 'redis'

const { REDIS_HOST, REDIS_PORT } = process.env

const client = createClient({
    url: `redis://${REDIS_HOST!}:${REDIS_PORT!}`,
    socket: {
        connectTimeout: 50000
    }
})

const subscriberClient = createClient({
    url: `redis://${REDIS_HOST!}:${REDIS_PORT!}`,
    socket: {
        connectTimeout: 50000
    }
})

;(async () => {
    await client.connect()
    await subscriberClient.connect()
})()

export default client

export const SubscriberClient = subscriberClient
