import { useState, useEffect } from 'react'

type DialogueItem = {
  agent: string
  response: string
}

function App() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [personality, setPersonality] = useState('professor')
  const [dialogue, setDialogue] = useState<DialogueItem[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    let timer: number

    if (loading && countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null))
      }, 1000)
    }

    if (!loading) {
      setCountdown(null) // zastav odpočítavanie, keď sa načítavanie skončí
    }

    return () => clearInterval(timer)
  }, [loading, countdown])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse('')
    setCountdown(300) // spusti odpočítavanie z 300 sekúnd

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ prompt: input, personality: personality }),
        body: JSON.stringify({ prompt: input }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data.reply)
      setDialogue(data.dialogue)
    } catch (err) {
      console.error(err)
      setError('Nepodarilo sa získať odpoveď od AI.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1>AI Chat</h1>
        <select
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          style={{ marginLeft: '2rem', padding: '0.5rem', height: '40px' }}
        >
          <option value='professor'>Profesor</option>
          <option value='friend'>Priateľ</option>
          <option value='jokester'>Vtipálek</option>
          <option value='assistant'>Asistent</option>
        </select>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Napíš otázku...'
          style={{ width: '300px', padding: '0.5rem' }}
        />

        {loading ? (
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
                verticalAlign: 'middle', // voliteľné doladenie zarovnania
              }}
            />
            <span>{countdown}s</span>
          </div>
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

      <div style={{ marginTop: '2rem' }}>
        <h3>AI Dialog:</h3>
        {dialogue.map((item, index) => (
          <div key={index}>
            <strong>{item.agent}:</strong>
            <p>{item.response}</p>
          </div>
        ))}
      </div>

      {/* 
      {dialogue.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>AI Dialog:</h3>
          {dialogue.map((item, index) => (
            <div key={index}>
              <strong>{item.agent}:</strong>
              <p>{item.response}</p>
            </div>
          ))}
        </div>
      )} */}

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
