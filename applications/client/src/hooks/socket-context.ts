import { createContext, useContext } from 'react'
import { Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export const useSocket = (): Socket => {
    const socket = useContext(SocketContext)

    if (socket === null) {
        throw new Error('useSocket must be used with a SocketContext')
    }

    return socket
}

export default SocketContext
