export type DialogueItem = {
  agent: string
  response: string
  timestamp?: string
  score?: number
  tokensUsed?: number // počet tokenov
  computationDetails?: string // informácie o technikách
}
