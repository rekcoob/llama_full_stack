// PersonalitySelector.tsx
import React from 'react'

interface PersonalitySelectorProps {
  personality: string
  setPersonality: React.Dispatch<React.SetStateAction<string>>
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({
  personality,
  setPersonality,
}) => {
  return (
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

    // <select
    //   value={personality}
    //   onChange={(e) => setPersonality(e.target.value)}
    //   style={{ marginLeft: '2rem', padding: '0.5rem', height: '40px' }}
    // >
    //   <option value='professor'>Profesor</option>
    //   <option value='friend'>Priateľ</option>
    //   <option value='jokester'>Vtipálek</option>
    //   <option value='assistant'>Asistent</option>
    // </select>
  )
}

export default PersonalitySelector
