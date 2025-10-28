export default function TimeDisplay({ time, label, showTime = true, isEndTime = false }) {
  if (!time) return null

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
  
      const now = new Date()
  
      const isToday = isSameDay(date, now)
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      const isYesterday = isSameDay(date, yesterday)
  
      if (isEndTime && date > now) {
        return date.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
  
      let dateText
      if (isToday) {
        dateText = 'Bugün'
      } else if (isYesterday) {
        dateText = 'Dün'
      } else {
        dateText = date.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
  
      if (!showTime) return dateText
  
      const timeText = date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      })
  
      return `${dateText} ${timeText}`
    } catch (error) {
      return dateString
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{formatDateTime(time)}</span>
    </div>
  )
}
