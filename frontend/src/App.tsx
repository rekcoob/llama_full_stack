import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data.reply)
    } catch (err) {
      console.error(err)
      setError('Nepodarilo sa získať odpoveď od AI.')
    } finally {
      setLoading(false)
    }
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
              verticalAlign: 'middle', // voliteľné doladenie zarovnania
            }}
          />
        ) : (
          <button type='submit' style={{ marginLeft: '1rem' }}>
            Poslať
          </button>
        )}
      </form>

      <div style={{ marginTop: '2rem' }}>
        {loading && <p>Čakám na odpoveď...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && response && (
          <>
            <strong>Odpoveď AI:</strong>
            <p>{response}</p>
          </>
        )}
      </div>

      {/* Inline CSS pre animáciu */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default App
