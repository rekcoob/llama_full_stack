import { useState } from 'react'
import axios from 'axios'

function App() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')

  const sendPrompt = async () => {
    const res = await axios.post('http://localhost:8000/chat', { prompt })
    setResponse(res.data.response)
  }

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold'>LLaMA Chat</h1>
      <textarea
        className='w-full border p-2 mt-4'
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className='mt-2 px-4 py-2 bg-blue-500 text-white'
        onClick={sendPrompt}
      >
        Send
      </button>
      <div className='mt-4 p-4 border bg-gray-100'>{response}</div>
    </div>
  )
}

export default App
