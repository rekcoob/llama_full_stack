// components/EngineSelector.tsx
import React from 'react'

type Props = {
  engine: string
  setEngine: (engine: string) => void
}

const EngineSelector: React.FC<Props> = ({ engine, setEngine }) => {
  return (
    <div style={{ marginLeft: '2rem' }}>
      <label htmlFor='engine-select'>Model:</label>
      <select
        id='engine-select'
        value={engine}
        onChange={(e) => setEngine(e.target.value)}
        style={{ marginLeft: '0.5rem' }}
      >
        <option value='ollama'>Ollama</option>
        <option value='sglang'>SGLang</option>
      </select>
    </div>
  )
}

export default EngineSelector
