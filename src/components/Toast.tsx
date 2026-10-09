import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'wishlist' | 'cart'
interface Toast { id: number; message: string; type: ToastType; icon?: string }
interface ToastCtx { show: (message: string, type?: ToastType, icon?: string) => void }

const ToastContext = createContext<ToastCtx>({ show: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const show = useCallback((message: string, type: ToastType = 'success', icon?: string) => {
    const id = ++counter.current
    setToasts((t) => [...t, { id, message, type, icon }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  const colorMap: Record<ToastType, string> = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3b82f6',
    wishlist: '#E40046',
    cart: '#f97316',
  }

  const iconMap: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    wishlist: '♥',
    cart: '🛒',
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ transform: 'translateX(-50%)', minWidth: 280 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white font-semibold text-[14px] pointer-events-auto"
            style={{
              backgroundColor: colorMap[t.type],
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[14px] font-extrabold shrink-0">
              {t.icon || iconMap[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(16px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
