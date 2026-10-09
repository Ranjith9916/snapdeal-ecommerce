import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, SparklesIcon, ZapIcon } from './Icons'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const commands = [
  { id: 'home', label: 'Go to Home', type: 'page', icon: '🏠', action: '/' },
  { id: 'search', label: 'Search Products', type: 'page', icon: '🔍', action: '/search' },
  { id: 'wishlist', label: 'My Wishlist', type: 'page', icon: '❤️', action: '/wishlist' },
  { id: 'cart', label: 'Shopping Cart', type: 'page', icon: '🛒', action: '/cart' },
  { id: 'checkout', label: 'Checkout', type: 'page', icon: '💳', action: '/checkout' },
  { id: 'dashboard', label: 'My Account / Dashboard', type: 'page', icon: '👤', action: '/dashboard' },
  { id: 'orders', label: 'My Orders', type: 'page', icon: '📦', action: '/dashboard' },
  { id: 'electronics', label: 'Shop Electronics', type: 'category', icon: '💻', action: '/search?cat=electronics' },
  { id: 'fashion', label: 'Shop Fashion', type: 'category', icon: '👗', action: '/search?cat=fashion' },
  { id: 'mobiles', label: 'Shop Mobiles', type: 'category', icon: '📱', action: '/search?cat=mobiles' },
  { id: 'beauty', label: 'Shop Beauty', type: 'category', icon: '💄', action: '/search?cat=beauty' },
  { id: 'flash', label: '⚡ Flash Deals', type: 'category', icon: '⚡', action: '/search?cat=flash' },
  { id: 'coupons', label: 'View My Coupons', type: 'account', icon: '🎟️', action: '/dashboard' },
  { id: 'returns', label: 'Returns & Refunds', type: 'account', icon: '↩️', action: '/dashboard' },
  { id: 'support', label: 'Help & Support', type: 'page', icon: '💬', action: '/' },
]

const aiSuggestions = [
  'Find gaming laptops below ₹70,000',
  'Best wireless earbuds for gym',
  'Cotton shirts for summer',
  'Budget phones under ₹15,000',
  'Suggest birthday gifts',
  'Skincare for oily skin',
]

const typeColors: Record<string, string> = {
  page: '#3b82f6',
  category: '#E40046',
  account: '#8b5cf6',
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = query.trim()
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()) || c.type.includes(query.toLowerCase()))
    : commands.slice(0, 8)

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, filtered.length - 1))
      if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0))
      if (e.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].action)
        onClose()
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, filtered, selected, navigate, onClose])

  if (!open) return null

  const handleSelect = (action: string) => {
    if (action.startsWith('/')) navigate(action)
    else navigate(`/search?q=${encodeURIComponent(action)}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden w-full max-w-[620px] mx-4"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.2)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <SearchIcon size={20} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, pages, categories…"
            className="flex-1 text-[16px] font-medium text-gray-800 outline-none bg-transparent placeholder-gray-300"
          />
          <kbd className="px-2 py-1 rounded-lg text-[11px] font-bold text-gray-400" style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e7eb' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* AI suggestions when empty */}
          {!query && (
            <div className="px-4 pt-3 pb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1">
                <SparklesIcon size={11} /> AI Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((s) => (
                  <button key={s} onClick={() => handleSelect(`/search?q=${encodeURIComponent(s)}`)}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-medium text-gray-700 hover:bg-red-50 hover:text-[#E40046] transition-all"
                    style={{ backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Commands */}
          <div className="px-3 pb-3">
            {!query && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1 mt-3">Quick Navigation</p>}
            {filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => handleSelect(cmd.action)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                style={{ backgroundColor: i === selected ? '#fff5f7' : 'transparent' }}
                onMouseEnter={() => setSelected(i)}
              >
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] shrink-0" style={{ backgroundColor: '#f5f5f5' }}>{cmd.icon}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-gray-800">{cmd.label}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: typeColors[cmd.type] + '15', color: typeColors[cmd.type] }}
                >
                  {cmd.type}
                </span>
              </button>
            ))}

            {query && filtered.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[16px] font-bold text-gray-700 mb-1">No results for "{query}"</p>
                <button onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose() }}
                  className="mt-2 px-5 py-2.5 rounded-xl font-bold text-[14px] text-white"
                  style={{ backgroundColor: '#E40046' }}>
                  Search in Products →
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
            <div className="flex items-center gap-4 text-[11px] text-gray-400">
              <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono text-[10px]">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono text-[10px]">↵</kbd> Select</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <ZapIcon size={11} className="text-[#E40046]" />
              <span>Snapdeal Command</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
