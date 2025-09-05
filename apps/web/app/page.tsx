'use client'
import React, { useState } from 'react'
import Button from '@repo/ui/Button'
import InputBox from '@repo/ui/InputBox'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

function Page () {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')

  function generateRoomCode () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  }

  function handleNewChat () {
    const newRoomCode = generateRoomCode()
    router.push(`/${newRoomCode}`)
  }

  function handleJoinChat () {
    if (roomCode.trim()) {
      if(roomCode.length !== 6) {
        toast.error('Room code must be 6 characters long')
        return
      }
      router.push(`/${roomCode}`)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <h1 className='text-7xl mb-4'>zapChat</h1>
      <Button
        onClick={handleNewChat}
        varient='primary'
        text='New Chat'
      />
      <p className='mt-2 mb-3 text-xs text-gray-200'>or</p>
      <InputBox
        placeholder='Enter code to join'
        value={roomCode}
        onChange={v => setRoomCode(v)}
        varient='primary'
        onClick={handleJoinChat}
        text='Join'
      />
    </div>
  )
}

export default Page