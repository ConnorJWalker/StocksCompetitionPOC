import { createClient } from 'redis'

const client = createClient();

(async () => client.connect())()

export default client
