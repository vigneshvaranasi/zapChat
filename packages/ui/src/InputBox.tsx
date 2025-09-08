import Button from './Button'
type InputBoxProps = {
  placeholder: string
  value: string
  onChange: (value: string) => void

  //   Button Props
  varient: 'primary' | 'chat'
  text?: string
  onClick: () => void
  handleEnter?: boolean
}

function InputBox (
{ placeholder, value, onChange, varient = 'primary', text, onClick,handleEnter }: InputBoxProps
) {
  return (
    <div className='ui:flex ui:justify-between  ui:items-center  ui:border  ui:border-[#4a4a4a]  ui:p-1  ui:rounded-lg  ui:bg-[#2e2e2e]'>
      <input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className='ui:focus:outline-none  ui:p-2  ui:rounded-lg ui:w-full'
        onKeyDown={e => {
          if (handleEnter && e.key === 'Enter') {
            e.preventDefault()
            onClick()
          }
        }}
      />
      <Button
        onClick={onClick}
        varient={varient}
        text={text}
      />
    </div>
  )
}

export default InputBox
