import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)          // useRef keeps a counter that does not cause re-render

  const show = useCallback((message, type = 'ok') => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  const value = { success: (m) => show(m, 'ok'), error: (m) => show(m, 'error') }
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts">
        {toasts.map((t) => <div key={t.id} className={'toast ' + (t.type === 'error' ? 'error' : '')}>{t.type === 'error' ? '⚠️ ' : '✅ '}{t.message}</div>)}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
