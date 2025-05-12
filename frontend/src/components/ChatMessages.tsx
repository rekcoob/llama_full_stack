import type { DialogueItem } from '../types'
import './ChatMessages.css'

const ChatMessages = ({ dialogue }: { dialogue: DialogueItem[] }) => {
  return (
    <div className='chat-container'>
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
              {item.timestamp} • Score: {(item.score ?? 0.85).toFixed(2)}
            </span>
          </div>
          <div className='bubble-text'>{item.response}</div>
        </div>
      ))}
    </div>
  )
}

export default ChatMessages
