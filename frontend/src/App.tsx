import { useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  // MiniMap,
  type Edge,
  type Node,
  Position, // <== 🔧 PRIDAJ TOTO
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type DialogueItem = {
  agent: string
  response: string
  timestamp?: string
  score?: number
}

function App() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [personality, setPersonality] = useState('professor')
  const [dialogue, setDialogue] = useState<DialogueItem[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)

  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    // let timer: number
    let timer: ReturnType<typeof setInterval>

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

  const toggleCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const dialogueToFlow = (dialogue: DialogueItem[]) => {
    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    dialogue.forEach((item, index) => {
      const nodeId = `node-${index}`
      const isCollapsed = collapsedNodes.has(nodeId)

      const shortText =
        item.response.split('\n')[0].slice(0, 50) +
        (item.response.length > 50 ? '...' : '')
      const displayText = isCollapsed ? shortText : item.response

      newNodes.push({
        id: nodeId,
        position: { x: 100 + (index % 2) * 300, y: index * 160 },
        data: {
          label: `${item.agent}: ${displayText}`,
          title: `Čas: ${item.timestamp ?? '12:34'}, Skóre: ${
            item.score ?? '0.85'
          }`,
        },
        style: {
          padding: 10,
          border: '1px solid #999',
          borderRadius: 8,
          backgroundColor: item.agent === 'agentA' ? '#e0f7fa' : '#fce4ec',
          cursor: 'pointer',
        },
        draggable: false,
        selectable: false,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })

      if (index > 0) {
        newEdges.push({
          id: `edge-${index}`,
          source: `node-${index - 1}`,
          target: nodeId,
          type: 'smoothstep',
        })
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse('')
    setCountdown(300)

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
      const enrichedDialogue = data.dialogue.map((item: DialogueItem) => ({
        ...item,
        timestamp: new Date().toLocaleTimeString(),
        score: Math.random().toFixed(2),
      }))

      setResponse(data.reply)
      setDialogue(enrichedDialogue)
      dialogueToFlow(enrichedDialogue)
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
        <h3>AI Dialog:</h3>
        {dialogue.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Vizualizácia dialógu:</h3>
            <div
              style={{ height: 600, border: '1px solid #ccc' }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                const nodeId = target
                  .closest('[data-id]')
                  ?.getAttribute('data-id')
                if (nodeId) {
                  toggleCollapse(nodeId)
                }
              }}
            >
              <ReactFlow nodes={nodes} edges={edges} fitView>
                {/* <MiniMap /> */}
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          </div>
        )}
      </div>

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
