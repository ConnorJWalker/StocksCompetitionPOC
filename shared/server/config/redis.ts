import { createClient } from 'redis'

const client = createClient({
    socket: {
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!)
    }
})

const subscriberClient = createClient({
    socket: {
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!)
    }
})

;(async () => {
    await client.connect()
    await subscriberClient.connect()
})()

export default client

export const SubscriberClient = subscriberClient
