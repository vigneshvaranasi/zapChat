'use client'
import { useState } from 'react'
import InputBox from './InputBox'
import {motion, AnimatePresence} from 'framer-motion'

type ModalProps = {
  isOpen: boolean
  onSubmit: (value: string) => void
}

function Modal ({ isOpen, onSubmit }: ModalProps) {
  const [username, setUsername] = useState<string>('')
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.3 }}
          className='ui:fixed ui:inset-0 ui:bg-black ui:bg-opacity-50 ui:flex ui:justify-center ui:items-center ui:z-50'
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='ui:bg-[#4a4a4a] ui:rounded-lg ui:p-6 ui:w-full ui:max-w-md'
          >
            <h2 className='ui:text-xl ui:font-semibold ui:mb-4'>Enter Username</h2>
            <div className='ui:flex ui:flex-col ui:gap-4'>
              <InputBox
                placeholder='Username'
                value={username}
                onChange={v => setUsername(v)}
                handleEnter={true}
                varient='primary'
                text='Enter'
                onClick={()=>{
                    onSubmit(username)
                }}                        
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
