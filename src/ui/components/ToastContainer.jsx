import { useToast } from '../../context/ToastContext'

const typeStyles = {
  success: { background: '#10b981' },
  error: { background: '#ef4444' },
  info: { background: '#3b82f6' },
}

export default function ToastContainer() {
  const { toasts, remove } = useToast()
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000, display: 'grid', gap: 8, maxWidth: 360 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          color: 'white',
          padding: '12px 16px',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontSize: '14px',
          fontWeight: '500',
          minWidth: '280px',
          ...typeStyles[t.type] || typeStyles.info,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ whiteSpace: 'pre-wrap' }}>{t.message}</div>
          <button onClick={() => remove(t.id)} style={{ color: 'white', opacity: 0.9, background: 'transparent', border: 0, cursor: 'pointer' }}>✕</button>
        </div>
      ))}
    </div>
  )
}


