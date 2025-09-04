import { WebSocketServer, WebSocket } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

type ROOM = {
  [key: string]: {
    clients: {
      socket: WebSocket
      name: string
    }[]
  }
}

let ROOMS: ROOM = {}

wss.on('connection', socket => {
  console.log('Client connected')
  // To do : verify auth

  socket.on('message', message => {
    try {
      const parsedMessage = JSON.parse(message.toString())
      console.log('parsedMessage: ', parsedMessage)
      if (parsedMessage.type === 'join') {
        const roomCode: string = parsedMessage.payload.roomCode
        const userName: string = parsedMessage.payload.username
        joinRoom(socket, roomCode, userName)
      }
      else if (parsedMessage.type === 'chat') {
        // verify if user is in room & room exists
        if (!checkRommExists(parsedMessage.payload.roomCode)) {
          socket.send(
            JSON.stringify({ error: 'Room does not exist' })
          )
          return
        }
        if (!checkClientInRoom(socket, parsedMessage.payload.roomCode)) {
          socket.send(
            JSON.stringify({ error: 'You are not in this room' })
          )
          return
        }

        const roomCode: string = parsedMessage.payload.roomCode
        const msg: string = parsedMessage.payload.message
        const userName: string = parsedMessage.payload.username
        broadCastMessage(
          roomCode,
          msg,
          userName
        )
      }
    } catch (err) {
      console.error('Error parsing message:', err)
    }
  })
  socket.on('close', () => {
    // remove socket from all rooms
    Object.keys(ROOMS).forEach(roomCode => {
      leaveRoom(socket, roomCode)
    })
    console.log('Client disconnected')
  })
})

function joinRoom (socket: WebSocket, roomCode: string, userName: string) {
  if (!ROOMS[roomCode]) {
    ROOMS[roomCode] = { clients: [] }
  }
  ROOMS[roomCode].clients.push({ socket, name: userName })
  console.log(
    `Client joined room: ${roomCode}. Total clients in room: ${ROOMS[roomCode].clients.length}`
  )
}

function broadCastMessage (roomCode: string, message: string,userName:string) {
  const room = ROOMS[roomCode]
  const clients = room ? room.clients : []
  clients.forEach(clientObj => {
    if (clientObj.socket.readyState === WebSocket.OPEN) {
      clientObj.socket.send(
        JSON.stringify({  message, from:userName  })
      )
    }
  })
}


function checkRommExists(roomCode: string): boolean {
  return !!ROOMS[roomCode]
}

function checkClientInRoom(socket: WebSocket, roomCode: string): boolean {
  const room = ROOMS[roomCode]
  if (!room) return false
  return room.clients.some(clientObj => clientObj.socket === socket)
}

function leaveRoom(socket: WebSocket, roomCode: string) {
  const room = ROOMS[roomCode]
  if (!room) return
  room.clients = room.clients.filter(clientObj => clientObj.socket !== socket)
  console.log(
    `Client left room: ${roomCode}. Total clients in room: ${room.clients.length}`
  )
}

console.log('WebSocket server running on ws://localhost:8080')
