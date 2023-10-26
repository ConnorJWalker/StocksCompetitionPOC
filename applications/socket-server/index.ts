import { Server } from 'socket.io'
import 'dotenv/config'
import * as fs from 'fs'
import * as https from 'https'
import { SubscriberClient } from 'shared-server/config/redis'
import IAccountValueResponse from 'shared-models/dto/iaccount-value-response'
import IAccountValue from 'shared-models/iaccount-value'
import IAccountValueUpdate from 'shared-models/redis/iaccount-value-update'

let previousAccountValues: IAccountValueResponse[] = []

const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
})

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

server.listen(443)

;(async () => {
    await SubscriberClient.subscribe('account-values-update', (message: string) => {
        const newAccountValues = JSON.parse(message) as IAccountValueUpdate

        let changedValues: IAccountValueResponse[] = []
        newAccountValues.values.forEach(value => {
            const previousValueIndex = previousAccountValues.findIndex(value => value.user.id === value.user.id)

            if (previousValueIndex === -1) {
                changedValues.push(value)
                return
            }

            const previousValue = previousAccountValues[previousValueIndex].values as IAccountValue
            const currentValue = value.values as IAccountValue

            if (currentValue.total !== previousValue.total) {
                changedValues.push(value)
            }
        })

        io.sockets.emit('account-values-update', JSON.stringify({
            savedToDatabase: newAccountValues.savedToDatabase,
            values: changedValues
        }))

        previousAccountValues = newAccountValues.values
    })
})()
