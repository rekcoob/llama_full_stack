import { useState, useEffect } from 'react'
import ChatForm from './components/ChatForm'
import DialogVisualization from './components/DialogVisualization'
import PersonalitySelector from './components/PersonalitySelector'
import ChatMessages from './components/ChatMessages'
import { ChatProvider } from './context/ChatContext'
import {
  // ReactFlow,
  // Background,
  // Controls,
  // MiniMap,
  type Edge,
  type Node,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { DialogueItem } from './types'

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
    setDialogue([])
    setCountdown(300)

    try {
      const res = await fetch('http://localhost:8000/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`Stream error: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let buffer = ''
      const runningDialogue: DialogueItem[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const evt of events) {
          if (evt.startsWith('data:')) {
            const json = JSON.parse(evt.slice(5).trim())
            const { agent, token } = json

            // nájdi poslednú repliku od daného agenta
            const lastItem = runningDialogue[runningDialogue.length - 1]
            if (!lastItem || lastItem.agent !== agent) {
              runningDialogue.push({
                agent,
                response: token,
                timestamp: new Date().toLocaleTimeString(),
                score: Math.random(), // alebo pevne 0.85
              })
            } else {
              lastItem.response += token
            }

            // aktualizuj stav priebežne
            setDialogue([...runningDialogue])
            setResponse(
              runningDialogue
                .map((d) => `${d.agent}: ${d.response}`)
                .join('\n\n')
            )
            dialogueToFlow(runningDialogue)
          }
        }
      }
    } catch (err) {
      console.error(err)
      setError('Chyba pri načítaní streamu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ChatProvider>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1>AI Chat</h1>
          <PersonalitySelector
            personality={personality}
            setPersonality={setPersonality}
          />
        </div>

        <ChatForm
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          loading={loading}
          countdown={countdown}
        />

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
          {dialogue.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>AI Dialog:</h3>
              <ChatMessages dialogue={dialogue} />
            </div>
          )}

          {dialogue.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Dialog VIsualisation:</h3>

              <DialogVisualization
                nodes={nodes}
                edges={edges}
                toggleCollapse={toggleCollapse}
              />
            </div>
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
    </ChatProvider>
  )
}

export default App
