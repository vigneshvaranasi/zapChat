import { WebSocketServer, WebSocket } from 'ws'
import type { WsClient,WsRoom,WsChatMessage,WsCntPingMessage,WsJoinMessage,WsMessage,WsMessagePingMessage } from '@repo/types'

const ROOMS = new Map<string, WsRoom>()
const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', socket => {
  console.log('Client connected')

  socket.on('message', raw => {
    try {
      const msg: WsMessage = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'join':
          const joinMsg = msg as WsJoinMessage
          joinRoom(socket, joinMsg.payload.roomCode, joinMsg.payload.username)
          break

        case 'chat':
          const chatMsg = msg as WsChatMessage
          handleChat(socket, chatMsg.payload)
          break
      }
    } catch (err) {
      console.error('Error parsing message:', err)
    }
  })

  socket.on('close', () => {
    for (const [roomCode] of ROOMS) {
      leaveRoom(socket, roomCode)
    }
    console.log('Client disconnected')
  })
})

function joinRoom (socket: WebSocket, roomCode: string, username: string) {
  if (!ROOMS.has(roomCode)) {
    ROOMS.set(roomCode, { clients: [] })
  }
  const room = ROOMS.get(roomCode)!
  if (!room.clients.find((c: WsClient) => c.socket === socket)) {
    room.clients.push({ socket, name: username })
  }
  broadcast(roomCode, room.clients.length.toString(), 'System', 'cntPing')
}

function leaveRoom (socket: WebSocket, roomCode: string) {
  const room = ROOMS.get(roomCode)
  if (!room) return
  room.clients = room.clients.filter(c => c.socket !== socket)
  broadcast(roomCode, `${room.clients.length}`, 'System', 'cntPing')
}

function handleChat (socket: WebSocket, payload: WsChatMessage['payload']) {
  const room = ROOMS.get(payload.roomCode)
  if (!room) {
    return socket.send(JSON.stringify({ error: 'Room does not exist' }))
  }
  if (!room.clients.find((c:WsClient )=> c.socket === socket)) {
    return socket.send(JSON.stringify({ error: 'You are not in this room' }))
  }
  broadcast(payload.roomCode, payload.message, payload.from, 'messagePing', socket)
}

function broadcast (
  roomCode: string,
  message: string,
  from: string,
  type: WsMessage['type'],
  socket?: WebSocket
) {
  const room = ROOMS.get(roomCode)
  if (!room) return
  room.clients.forEach(c => {
    if (c.socket.readyState !== WebSocket.OPEN) return
    if (type === 'messagePing') {
      // Skip the sender's socket
      if (c.socket === socket) return
      const msg: WsMessagePingMessage = {
        type: 'messagePing',
        payload: { message, from }
      }
      c.socket.send(JSON.stringify(msg))
    } else if (type === 'cntPing') {
      const count = parseInt(message)
      const msg: WsCntPingMessage = {
        type: 'cntPing',
        payload: { count }
      }
      c.socket.send(JSON.stringify(msg))
    }
  })
}

console.log('WebSocket server running on ws://localhost:8080')
