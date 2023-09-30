import { createClient } from 'redis'

const client = createClient()

const subscriberClient = createClient()

;(async () => {
    await client.connect()
    await subscriberClient.connect()
})()

export default client

export const SubscriberClient = subscriberClient
