'use client'
import { useEffect, use, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { wsURL } from '../config'
import Button from '@repo/ui/Button'
import InputBox from '@repo/ui/InputBox'
import ChatBubble from './ChatBubble'

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
  const [inputMessage, setInputMessage] = useState('')

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
      } else if (msg.type === 'cntPing') {
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
    <div className='p-6 flex flex-col h-screen'>
      {/* to do: Navbar */}
      <div className='border border-[#353636] w-full  sm:max-w-3xl rounded-xl mx-auto mb-4 flex justify-between items-center px-4 py-2'>
        <p className='text-lg text-[#CFCFCF]'>ZapChat</p>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Copied to clipboard')
          }}
          varient='primary'
          text='Invite'
        />
      </div>
      {/* Chat Interface */}
      <div className='flex-1 flex flex-col min-h-0 w-full sm:w-md mx-auto rounded-xl bg-[#262626] border border-[#353636]'>
        {/* room code & leave */}
        <div className='flex justify-between items-center border-b border-[#353636] p-3 px-4'>
          <p>Room Code: {roomCode}</p>
          <Button
            text='Leave'
            varient='danger'
            onClick={() => {
              router.push('/')
              toast.success('Left the room')
            }}
          />
        </div>
        {/* messages */}
        <div className='flex-1 min-h-0 px-4 overflow-y-auto py-3 space-y-2'>
          <ChatBubble message='Hiii... Hello' varient='received' from='Vignesh' />
          <ChatBubble message='Hey' varient='sent' />
          <ChatBubble message='Hiii...' varient='received' from='Vignesh' />
          <ChatBubble message='Hey' varient='sent' />
          <ChatBubble message='Hiii...' varient='received' from='Vignesh' />
          <ChatBubble message='Hey' varient='sent' />
          <ChatBubble message='Hiii...' varient='received' from='Vignesh' />
          <ChatBubble message='Hey' varient='sent' />
          <ChatBubble message='Hiii...' varient='received' from='Vignesh' />
          <ChatBubble message='Hey' varient='sent' />
          <ChatBubble message='Hiii...' varient='received' from='Vignesh' />
          <ChatBubble message='Hey' varient='sent' />
        </div>
        {/* chat input */}
        <div className='p-4'>
          <InputBox
            placeholder='Type a message...'
            onClick={() => {
              toast.success('Message Sent')
            }}
            value={inputMessage}
            onChange={(value: string) => setInputMessage(value)}
            varient='chat'
          />
        </div>
      </div>
    </div>
  )
}
