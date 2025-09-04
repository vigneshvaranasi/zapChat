'use client'
import React, { useState } from 'react'
import Button from '@repo/ui/Button'
import InputBox from '@repo/ui/InputBox'
import toast from 'react-hot-toast'

function page () {
  const [roomCode, setRoomCode] = useState('')

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <h1 className='text-7xl mb-4'>zapChat </h1>
      <Button
        onClick={() => toast.success('New Chat Clicked')}
        varient='primary'
        text='New Chat'
      />
      <p className='mt-2 mb-3 text-xs text-gray-200'>or</p>
      <InputBox
        placeholder='Enter code to join'
        value={roomCode}
        onChange={value => setRoomCode(value)}
        varient='primary'
        onClick={() => alert('Join Room Clicked')}
        text='Join'
      />
    </div>
  )
}

export default page
