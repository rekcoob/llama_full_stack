import { useState } from 'react'
import ChatForm from './components/ChatForm'
import DialogVisualization from './components/DialogVisualization'
import PersonalitySelector from './components/PersonalitySelector'
import ChatMessages from './components/ChatMessages'
import CountdownTimer from './components/CountdownTimer'
import EngineSelector from './components/EngineSelector'
import { ChatProvider } from './context/ChatContext'
import { type Edge, type Node, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { DialogueItem } from './types'
import QuestionSelector from './components/QuestionSelector'

function App() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [personality, setPersonality] = useState('professor')
  const [dialogue, setDialogue] = useState<DialogueItem[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)

  const [showVisualization, setShowVisualization] = useState(false)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  const [totalTokens, setTotalTokens] = useState(0)
  const [engine, setEngine] = useState('ollama')

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
    setDialogue([])
    setCountdown(0)
    setTotalTokens(0)

    try {
      // Zavoláme obe fetch simultánne
      const urls = [
        'http://192.168.49.2:30080/api/chat-stream',
        'http://backend:8000/api/chat-stream',
      ]

      // Funkcia na spracovanie jedného streamu
      const processStream = async (res: Response) => {
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
              const { agent, token, total_tokens } = json
              setTotalTokens(total_tokens)

              const lastItem = runningDialogue[runningDialogue.length - 1]
              if (!lastItem || lastItem.agent !== agent) {
                runningDialogue.push({
                  agent,
                  response: token,
                  timestamp: new Date().toLocaleTimeString(),
                  score: Math.random(),
                })
              } else {
                lastItem.response += token
              }

              setDialogue((prev) => [...prev, ...runningDialogue])
              dialogueToFlow(runningDialogue)
            }
          }
        }
      }

      // Zavoláme obe fetch simultánne a spracujeme oba streamy paralelne
      const fetches = urls.map((url) =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input, engine }),
        }).then(processStream)
      )

      await Promise.all(fetches)
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
          <h1>AIE Chat</h1>
          <div style={{ display: 'none' }}>
            <PersonalitySelector
              personality={personality}
              setPersonality={setPersonality}
            />
          </div>
          <EngineSelector engine={engine} setEngine={setEngine} />
        </div>

        <ChatForm
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          loading={loading}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginTop: '2rem' }}>
          {loading && (
            <CountdownTimer
              countdown={countdown}
              setCountdown={setCountdown}
              loading={loading}
            />
          )}
        </div>

        <QuestionSelector setInput={setInput} />

        <div style={{ marginTop: '2rem' }}>
          {dialogue.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>AI Dialog:</h3>
              <ChatMessages dialogue={dialogue} totalTokens={totalTokens} />
            </div>
          )}

          {dialogue.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={() => setShowVisualization((prev) => !prev)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {showVisualization
                  ? 'Skryť vizualizáciu'
                  : 'Zobraziť vizualizáciu'}
              </button>
            </div>
          )}

          {dialogue.length > 0 && showVisualization && (
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
      </div>
    </ChatProvider>
  )
}

export default App
