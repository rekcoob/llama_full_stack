// components/QuestionSelector.tsx
const questions = [
  'Vysvetli kvantovú fyziku ako pre dieťa.',
  'Ako funguje blockchain?',
  'Porovnaj AI ChatGPT a človeka pri písaní eseje.',
  'Aký je rozdiel medzi strojovým učením a hlbokým učením?',
]

export default function QuestionSelector({
  setInput,
}: {
  setInput: (q: string) => void
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h4>Rýchle otázky:</h4>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => setInput(q)}
          style={{ margin: '0.5rem' }}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
