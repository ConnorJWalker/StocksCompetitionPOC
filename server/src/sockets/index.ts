import { Server } from 'socket.io'
import { SubscriberClient } from '../shared/config/redis'
import IAccountValueResponse from '../shared/models/dto/iaccount-value-response'
import IAccountValue from '../shared/models/iaccount-value'
import IAccountValueUpdate from '../shared/models/redis/iaccount-value-update'

let previousAccountValues: IAccountValueResponse[] = []

const io = new Server(parseInt(process.env.SOCKET_PORT!), {
    cors: {
        origin: '*'
    }
})

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
