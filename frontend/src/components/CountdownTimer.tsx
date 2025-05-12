import { useEffect } from 'react'

interface CountdownTimerProps {
  countdown: number | null
  setCountdown: React.Dispatch<React.SetStateAction<number | null>>
  loading: boolean
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  countdown,
  setCountdown,
  loading,
}) => {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>

    if (loading && countdown !== null) {
      // Začneme od 0 a každú sekundu pridávame 1
      timer = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev + 1 : 0))
      }, 1000)
    }

    if (!loading) {
      setCountdown(null) // zastav odpočítavanie, keď sa načítavanie skončí
    }

    return () => clearInterval(timer)
  }, [loading, countdown, setCountdown])

  if (countdown === null) return null

  return (
    <p>
      Čakám na odpoveď... <span>{countdown} sekúnd</span>
    </p>
  )
}

export default CountdownTimer
