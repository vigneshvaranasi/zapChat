import { WebSocket } from 'ws'

export type WsClient = { socket: WebSocket; name: string }
export type WsRoom = { clients: WsClient[] }

export type WsMessage = {
    type: 'join' | 'chat' | 'cntPing' | 'messagePing'
}

export type WsJoinMessage = WsMessage & {
    type: 'join'
    payload: {
        roomCode: string
        username: string
    }
}
export type WsChatMessage = WsMessage & {
    type: 'chat'
    payload: {
        roomCode: string
        message: string
        from: string
    }
}
export type WsCntPingMessage = WsMessage & {
    type: 'cntPing'
    payload: {
        count: number
    }
}
export type WsMessagePingMessage = WsMessage & {
    type: 'messagePing'
    payload: {
        message: string
        from: string
    }
}
