'use client'
import { useEffect, use, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { wsURL } from '../config'
import Button from '@repo/ui/Button'
import InputBox from '@repo/ui/InputBox'
import ChatBubble from '@repo/ui/ChatBubble'
import type {
  WsMessage,
  WsCntPingMessage,
  WsMessagePingMessage
} from '@repo/types'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '@repo/ui/Modal'

export default function ChatPage ({
  params
}: {
  params: Promise<{ roomCode: string }>
}) {
  const { roomCode } = use(params)
  const router = useRouter()
  const [username, setUsername] = useState<string>('')
  const socketRef = useRef<WebSocket | null>(null)
  const joinedRef = useRef<boolean>(false)
  const [messages, setMessages] = useState<WsMessagePingMessage['payload'][]>(
    []
  )
  const [joinCount, setJoinCount] = useState<number>(0)
  const [inputMessage, setInputMessage] = useState<string>('')
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true)
  const [showChatInterface, setShowChatInterface] = useState<boolean>(false)

  // Validate room code early
  useEffect(() => {
    if (!/^[A-Za-z0-9]{6}$/.test(roomCode)) {
      toast.error('Room code must be 6 characters long')
      router.push('/')
    }
  }, [roomCode, router])

  useEffect(() => {
    if (username && !isModalOpen) {
      const timer = setTimeout(() => {
        setShowChatInterface(true)
      }, 300)
      return () => clearTimeout(timer)
    } else if (!username) {
      setShowChatInterface(false)
    }
  }, [username, isModalOpen])

  useEffect(() => {
    if (!username) return
    if (!/^[A-Za-z0-9]{6}$/.test(roomCode)) return
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return

    const url = wsURL || 'ws://localhost:8080'
    const ws = new WebSocket(url)
    socketRef.current = ws
    console.log('Opening WS ->', url)

    ws.onopen = () => {
      if (joinedRef.current) return
      joinedRef.current = true
      const joinMessage = {
        type: 'join' as const,
        payload: { roomCode: roomCode, username: username }
      }
      ws.send(JSON.stringify(joinMessage))
      toast.success(`Joined ${roomCode}`)
    }

    ws.onmessage = (evt: MessageEvent) => {
      try {
        const msg: WsMessage = JSON.parse(evt.data)
        console.log('WS message', msg)
        if (msg.type === 'messagePing') {
          const pingMsg = msg as WsMessagePingMessage
          setMessages(prev => [...prev, pingMsg.payload])
        } else if (msg.type === 'cntPing') {
          const cntMsg = msg as WsCntPingMessage
          setJoinCount(cntMsg.payload.count)
        }
      } catch (e) {
        console.error('Error parsing WS message:', e)
      }
    }

    ws.onerror = (e: Event) => {
      console.error('WS error', e)
      toast.error('WebSocket error')
    }

    ws.onclose = () => {
      console.log('WS closed')
      socketRef.current = null
      joinedRef.current = false
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
      socketRef.current = null
      joinedRef.current = false
    }
  }, [username, roomCode])

  // Handle sending message
  function sendMessage () {
    if (!username || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to chat')
      return
    }
    const trimmed = inputMessage.trim()
    if (!trimmed) return
    const newMessage: WsMessagePingMessage['payload'] = {
      from: username,
      message: trimmed
    }
    setMessages(prev => [...prev, newMessage])
    try {
      const chatMessage = {
        type: 'chat' as const,
        payload: {
          roomCode,
          message: trimmed,
          from: username
        }
      }
      socketRef.current.send(JSON.stringify(chatMessage))
      setInputMessage('')
    } catch (e) {
      console.error('Send failed:', e)
      toast.error('Send failed')
      setMessages(prev => prev.slice(0, -1))
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className='p-6 flex flex-col h-screen'>
      <Modal
        isOpen={isModalOpen}
        onSubmit={(name: string) => {
          const trimmedName = name.trim().slice(0, 10)
          if (trimmedName) {
            setUsername(trimmedName)
            setIsModalOpen(false)
          }
        }}
      />
      <AnimatePresence>
        {showChatInterface && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col h-full'
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className='border border-[#353636] w-full sm:max-w-3xl rounded-xl mx-auto mb-4 flex justify-between items-center px-4 py-2'
            >
              <p
                onClick={() => {
                  router.push('/')
                }}
                className='text-lg text-[#CFCFCF] cursor-pointer'
              >
                ZapChat
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Copied to clipboard')
                }}
                varient='primary'
                text='Invite'
              />
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
              className='flex-1 flex flex-col min-h-0 w-full sm:w-md mx-auto rounded-xl bg-[#262626] border border-[#353636]'
            >
              {/* room code & leave */}
              <div className='flex justify-between items-center border-b border-[#353636] p-3 px-4'>
                <p>Room Code: {roomCode}</p>
                <p>Users: {joinCount}</p>
              </div>
              {/* messages */}
              <div
                ref={messagesContainerRef}
                className='flex-1 min-h-0 px-4 overflow-y-auto hide-scrollbar py-3 space-y-2'
              >
                {messages.length === 0 ? (
                  <p className='text-center text-gray-400 mt-10'>
                    No messages yet. Say hi!
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div className='flex flex-col w-full' key={index}>
                      <ChatBubble
                        key={index}
                        varient={msg.from === username ? 'sent' : 'received'}
                        message={msg.message}
                        from={msg.from === username ? undefined : msg.from}
                      />
                    </div>
                  ))
                )}
              </div>
              {/* chat input */}
              <div className='p-4'>
                <InputBox
                  placeholder='Type a message...'
                  onClick={() => {
                    sendMessage()
                  }}
                  value={inputMessage}
                  onChange={(value: string) => setInputMessage(value)}
                  varient='chat'
                  handleEnter={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
