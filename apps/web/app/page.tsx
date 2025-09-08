'use client'
import React, { useState } from 'react'
import Button from '@repo/ui/Button'
import InputBox from '@repo/ui/InputBox'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function Page () {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')

  function generateRoomCode () {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
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
      if (roomCode.length !== 6) {
        toast.error('Room code must be 6 characters long')
        return
      }
      router.push(`/${roomCode}`)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <motion.h1
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5 }}
        className='text-7xl mb-4'
      >
        zapChat
      </motion.h1>
      <motion.div 
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, delay: 0.3 }}
      className='flex flex-col justify-center items-center'>
        <Button onClick={handleNewChat} varient='primary' text='New Chat' />
        <p className='mt-2 mb-3 text-xs text-gray-200'>or</p>
        <InputBox
          placeholder='Enter code to join'
          value={roomCode}
          onChange={v => setRoomCode(v)}
          varient='primary'
          onClick={handleJoinChat}
          text='Join'
          handleEnter={true}
        />
      </motion.div>
    </div>
  )
}

export default Page
