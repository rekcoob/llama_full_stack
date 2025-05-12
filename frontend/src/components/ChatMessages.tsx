import type { DialogueItem } from '../types'
import './ChatMessages.css'

const ChatMessages = ({
  dialogue,
  totalTokens, // Accept totalTokens as a prop
}: {
  dialogue: DialogueItem[]
  totalTokens: number // Define the type for totalTokens as number
}) => {
  return (
    <div className='chat-container'>
      {/* Display the total tokens used */}
      {totalTokens > 0 && (
        <div className='total-tokens'>
          <strong>Total Tokens Used: {totalTokens}</strong>
        </div>
      )}

      {dialogue.map((item, index) => (
        <div
          key={index}
          className={`chat-bubble ${
            item.agent === 'Professor' ? 'left' : 'right'
          }`}
        >
          <div className='bubble-header'>
            <strong>{item.agent}</strong>
            <span className='meta'>
              {item.timestamp} • Score: {(item.score ?? 0.0).toFixed(2)}
            </span>
          </div>
          <div className='bubble-text'>{item.response}</div>

          {/* Zobrazenie tokenov a výpočtovej energie */}
          {item.tokensUsed !== undefined && (
            <div className='bubble-footer'>
              <span>Tokens used: {item.tokensUsed}</span>
            </div>
          )}
          {item.computationDetails && (
            <div className='bubble-footer'>
              <span>Computation energy: {item.computationDetails}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ChatMessages
