import { WebSocketServer, WebSocket } from 'ws'

type Client = { socket: WebSocket; name: string }
type Room = { clients: Client[] }

const ROOMS = new Map<string, Room>()
const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', socket => {
  console.log('Client connected')

  socket.on('message', raw => {
    try {
      const msg = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'join':
          joinRoom(socket, msg.payload.roomCode, msg.payload.username)
          break

        case 'chat':
          handleChat(socket, msg.payload)
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
  if (!room.clients.find(c => c.socket === socket)) {
    room.clients.push({ socket, name: username })
  }
  broadcast(roomCode, `${room.clients.length}`, 'System', 'cntPing')
}

function leaveRoom (socket: WebSocket, roomCode: string) {
  const room = ROOMS.get(roomCode)
  if (!room) return
  room.clients = room.clients.filter(c => c.socket !== socket)
  broadcast(roomCode, `${room.clients.length}`, 'System', 'cntPing')
}

function handleChat (socket: WebSocket, payload: any) {
  const room = ROOMS.get(payload.roomCode)
  if (!room) {
    return socket.send(JSON.stringify({ error: 'Room does not exist' }))
  }
  if (!room.clients.find(c => c.socket === socket)) {
    return socket.send(JSON.stringify({ error: 'You are not in this room' }))
  }
  broadcast(payload.roomCode, payload.message, payload.from, 'messagePing', socket)
}

function broadcast (
  roomCode: string,
  message: string,
  from: string,
  type: string,
  socket?: WebSocket
) {
  const room = ROOMS.get(roomCode)
  if (!room) return
  room.clients.forEach(c => {
    if (c.socket.readyState !== WebSocket.OPEN) return
    if (type === 'messagePing') {
      // Skip the sender's socket
      if (c.socket === socket) return
      c.socket.send(JSON.stringify({ type, from, message }))
    } else {
      c.socket.send(JSON.stringify({ type, from, message }))
    }
  })
}

console.log('WebSocket server running on ws://localhost:8080')
