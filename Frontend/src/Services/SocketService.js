import { io } from 'socket.io-client'

/*
    Socket.IO client singleton.

    The realtime connection is created once per workspace session and reused
    by the context. If there is no token (or the server does not support
    sockets, like Vercel serverless), connectSocket returns null and the app
    keeps working through the REST API.
*/
const API_URL = import.meta.env.VITE_APP_URL_BACKEND

let socket = null

function readToken() {
    return localStorage.getItem('auth_token') || localStorage.getItem('authToken')
}

export function connectSocket() {
    const authToken = readToken()

    if (!authToken) {
        return null
    }

    // Reuse the open connection unless the token changed (logout/login).
    if (socket) {
        if (socket.auth?.token === authToken) {
            if (!socket.connected) {
                socket.connect()
            }

            return socket
        }

        disconnectSocket()
    }

    socket = io(API_URL, {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        reconnection: true
    })

    return socket
}

export function getSocket() {
    return socket
}

export function disconnectSocket() {
    if (!socket) {
        return
    }

    socket.removeAllListeners()
    socket.disconnect()
    socket = null
}
