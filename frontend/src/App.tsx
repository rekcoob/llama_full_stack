import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const res = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    })

    const data = await res.json()
    setResponse(data.reply)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AI Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Napíš otázku...'
          style={{ width: '300px', padding: '0.5rem' }}
        />
        <button type='submit' style={{ marginLeft: '1rem' }}>
          Poslať
        </button>
      </form>
      <div style={{ marginTop: '2rem' }}>
        <strong>Odpoveď AI:</strong>
        <p>{response}</p>
      </div>
    </div>
  )
}

export default App
