type chatBubbleProps = {
  varient: 'sent' | 'received'
  message: string
  from?: string
}

function ChatBubble ({ varient, message, from }: chatBubbleProps) {
  return (
    <div
      className={`my-2 p-3 max-w-xs break-words rounded-lg min-w-fit
      ${
        varient === 'sent'
          ? 'bg-[#d8d8d8] text-black self-end'
          : 'bg-[#333333] text-white self-start'
      }
    `}
    >
      {from && varient === 'received' && (
        <p className='text-sm font-semibold mb-1'>{from}</p>
      )}
      <p>{message}</p>
    </div>
  )
}

export default ChatBubble
