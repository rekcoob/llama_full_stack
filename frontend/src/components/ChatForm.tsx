import React from 'react'
// import LoadingIndicator from './LoadingIndicator'

interface ChatFormProps {
  input: string
  // setInput: React.Dispatch<React.SetStateAction<string>>;
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
  countdown: number | null
}

const ChatForm: React.FC<ChatFormProps> = ({
  input,
  setInput,
  handleSubmit,
  loading,
  countdown,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Napíš otázku...'
        style={{ width: '300px', padding: '0.5rem' }}
        // disabled={loading}
      />

      {loading ? (
        // <LoadingIndicator countdown={countdown} />
        <div className=''>
          <div
            style={{
              display: 'inline-block',
              marginLeft: '1rem',
              width: '24px',
              height: '24px',
              border: '3px solid #ccc',
              borderTop: '3px solid #333',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              verticalAlign: 'middle',
            }}
          />
          <span>{countdown}s</span>
        </div>
      ) : (
        <button
          type='submit'
          style={{ marginLeft: '1rem' }}
          //   disabled={!input.trim()}
        >
          Poslať
        </button>
      )}
    </form>
  )
}

export default ChatForm
