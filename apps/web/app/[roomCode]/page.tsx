'use client'
import { useEffect, use, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { wsURL } from '../config'

export default function ChatPage ({
  params
}: {
  params: Promise<{ roomCode: string }>
}) {
  const { roomCode } = use(params)
  const router = useRouter()
  const [username, setUsername] = useState('')
  const socketRef = useRef<WebSocket | null>(null)
  const joinedRef = useRef(false)
  const [messages, setMessages] = useState<{ from: string; message: string }[]>(
    []
  )
  const [joinCount, setJoinCount] = useState(0)

  // Validate room code early
  useEffect(() => {
    if (!/^[A-Za-z0-9]{6}$/.test(roomCode)) {
      toast.error('Room code must be 6 characters long')
      router.push('/')
    }
  }, [roomCode, router])

  // Ask username once
  useEffect(() => {
    if (!username) {
      const name = (prompt('Enter your name') || '').trim().slice(0, 10)
      if (name) setUsername(name)
    }
  }, [username])

  useEffect(() => {
    if (!username) return
    if (!/^[A-Za-z0-9]{6}$/.test(roomCode)) return
    if (socketRef.current) return

    const url = wsURL || 'ws://localhost:8080'
    const ws = new WebSocket(url)
    socketRef.current = ws
    console.log('Opening WS ->', url)

    ws.onopen = () => {
      if (joinedRef.current) return
      joinedRef.current = true
      ws.send(
        JSON.stringify({
          type: 'join',
          payload: { roomCode: roomCode, username: username }
        })
      )
      toast.success(`Joined ${roomCode}`)
    }

    ws.onmessage = evt => {
      const msg = JSON.parse(evt.data)
      console.log('WS message', msg)
      if (msg.type === 'messagePing') {
        setMessages(prev => [...prev, { from: msg.from, message: msg.message }])
      }
      else if (msg.type === 'cntPing') {
        setJoinCount(msg.message)
      }
    }

    ws.onerror = e => {
      console.error('WS error', e)
      toast.error('WebSocket error')
    }

    ws.onclose = () => {
      console.log('WS closed')
    }

    return () => {
      ws.close()
      socketRef.current = null
      joinedRef.current = false
    }
  }, [username, roomCode])

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Room: {roomCode}</h1>
      <p className='text-sm text-gray-400'>
        Username: {username || '(setting...)'}
      </p>
      <p className='text-xs text-gray-500'>WS URL: {wsURL || 'NOT SET'}</p>
      {
        socketRef.current?.readyState === WebSocket.OPEN && (
          <div className='mt-4 space-y-2'>
            {messages.map((msg, idx) => (
              <div key={idx} className='p-2 border rounded'>
                <strong>{msg.from}:</strong> {msg.message}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
