import { Server } from 'socket.io'
import { SubscriberClient } from './config/redis'
import IAccountValueResponse from './models/dto/responses/iaccount-value-response'
import IAccountValue from './models/iaccount-value'

let previousAccountValues: IAccountValueResponse[] = []

const io = new Server(parseInt(process.env.SOCKET_PORT!), {
    cors: {
        origin: '*'
    }
})

;(async () => {
    await SubscriberClient.subscribe('account-values-update', (message: string) => {
        const newAccountValues = JSON.parse(message) as IAccountValueResponse[]

        let changedValues: IAccountValueResponse[] = []
        newAccountValues.forEach(value => {
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

        io.sockets.emit('account-values-update', JSON.stringify(changedValues))
        previousAccountValues = newAccountValues
    })
})()
