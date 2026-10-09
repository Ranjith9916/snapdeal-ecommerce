import { useState, useEffect } from 'react'

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      const timer = setTimeout(() => setShowRestored(false), 3500)
      return () => clearTimeout(timer)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return (
      <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 text-center sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2">
        <span>📡</span>
        <span>You are currently offline. Please check your internet connection. Changes may not sync until connection is restored.</span>
      </div>
    )
  }

  if (showRestored) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center sticky top-0 z-[100] shadow-md animate-fade-in flex items-center justify-center gap-2">
        <span>✓</span>
        <span>Back online! Internet connection restored.</span>
      </div>
    )
  }

  return null
}
