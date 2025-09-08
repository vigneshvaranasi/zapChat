type chatBubbleProps = {
  varient: 'sent' | 'received'
  message: string
  from?: string
}

function ChatBubble ({ varient, message, from }: chatBubbleProps) {
  return (
    <div
      className={`ui:my-2 ui:p-3 ui:max-w-xs ui:break-words ui:rounded-lg ui:min-w-fit
      ${
        varient === 'sent'
          ? 'ui:bg-[#d8d8d8] ui:text-black ui:self-end'
          : 'ui:bg-[#333333] ui:text-white ui:self-start'
      }
    `}
    >
      {from && varient === 'received' && (
        <p className='ui:text-sm ui:font-semibold ui:mb-1'>{from}</p>
      )}
      <p>{message}</p>
    </div>
  )
}

export default ChatBubble
