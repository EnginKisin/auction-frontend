import { useState, useEffect } from 'react'

export default function CountdownTimer({ endTime, startTime, isActive }) {
  const [timeLeft, setTimeLeft] = useState({})
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!endTime || !isActive) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const difference = end - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({})
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime, isActive])

  if (!isActive) {
    return <span style={{ color: '#ef4444', fontWeight: 500 }}>Kapalı</span>
  }

  if (isExpired) {
    return <span style={{ color: '#ef4444', fontWeight: 500 }}>Süre Doldu</span>
  }

  const formatTime = (value, label) => {
    if (value === 0) return null
    return `${value}${label}`
  }

  const timeParts = [
    formatTime(timeLeft.days, 'g'),
    formatTime(timeLeft.hours, 's'),
    formatTime(timeLeft.minutes, 'dk'),
    formatTime(timeLeft.seconds, 'sn')
  ].filter(Boolean)

  if (timeParts.length === 0) {
    return <span>Hesaplanıyor...</span>
  }

  return (
    <div style={{ 
      display: 'flex', 
      gap: 4, 
      alignItems: 'center',
      color: timeLeft.hours < 1 ? '#ef4444' : timeLeft.hours < 6 ? '#f59e0b' : '#059669',
      fontWeight: 500
    }}>
      <span>⏰</span>
      {timeParts.join(' ')}
    </div>
  )
}
