import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let nextToastId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message, options = {}) => {
    const id = nextToastId++
    const toast = {
      id,
      message: String(message || ''),
      type: options.type || 'info',
      duration: Number(options.duration || 3500),
    }
    setToasts((prev) => [...prev, toast])
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration)
    }
    return id
  }, [remove])

  const success = useCallback((message, options = {}) => show(message, { ...options, type: 'success' }), [show])
  const error = useCallback((message, options = {}) => show(message, { ...options, type: 'error' }), [show])
  const info = useCallback((message, options = {}) => show(message, { ...options, type: 'info' }), [show])

  const value = useMemo(() => ({ toasts, show, success, error, info, remove }), [toasts, show, success, error, info, remove])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


