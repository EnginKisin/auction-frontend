export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content"
        style={{ 
          background: 'var(--color-secondary)', 
          borderRadius: 12, 
          width: 'min(500px, 95vw)', 
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
        }}
      >
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--color-border)', 
          fontWeight: 600,
          color: 'var(--color-accent)',
          fontSize: '1.1em'
        }}>
          {title}
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}


