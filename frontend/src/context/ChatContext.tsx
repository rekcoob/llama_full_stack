// ChatContext.tsx
import { createContext, useContext, useState } from 'react'

type DialogueItem = {
  agent: string
  response: string
  timestamp?: string
  score?: number
}

interface ChatContextType {
  input: string
  setInput: (val: string) => void
  personality: string
  setPersonality: (val: string) => void
  dialogue: DialogueItem[]
  setDialogue: (items: DialogueItem[]) => void
  response: string
  setResponse: (val: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [input, setInput] = useState('')
  const [personality, setPersonality] = useState('professor')
  //   const [loading, setLoading] = useState(false)
  const [dialogue, setDialogue] = useState<DialogueItem[]>([])
  const [response, setResponse] = useState('')

  return (
    <ChatContext.Provider
      value={{
        input,
        setInput,
        personality,
        setPersonality,
        dialogue,
        setDialogue,
        response,
        setResponse,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  // if (context === undefined) {
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
