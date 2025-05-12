import React from 'react'
// import LoadingIndicator from './LoadingIndicator'

interface ChatFormProps {
  input: string
  // setInput: React.Dispatch<React.SetStateAction<string>>;
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
}

const ChatForm: React.FC<ChatFormProps> = ({
  input,
  setInput,
  handleSubmit,
  loading,
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
      ) : (
        <button
          type='submit'
          style={{ marginLeft: '1rem' }}
          //   disabled={!input.trim()}
        >
          Poslať
        </button>
      )}
      {/* Inline CSS pre animáciu */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </form>
  )
}

export default ChatForm
