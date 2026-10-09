import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import {
  SearchIcon, CameraIcon, MicIcon, HeartIcon, CartIcon,
  BellIcon, TrendingIcon, ClockIcon, SparklesIcon,
  MapPinIcon, ChevronDownIcon, UserIcon
} from './Icons'
import WishlistPanel from './WishlistPanel'
import CartPanel from './CartPanel'
import NotificationsPanel from './NotificationsPanel'
import VisualSearchModal from './VisualSearchModal'

interface HeaderProps {
  onMenuClick?: () => void
  onCommandPalette?: () => void
  onLoginClick?: () => void
}

const recentSearches = [
  'bluetooth earphones under ₹1000',
  'women kurta set',
  'face serum vitamin c',
  'running shoes nike',
]

const trendingSearches = [
  'Best laptop for students',
  'Wireless earbuds under ₹2000',
  'Cotton shirts for summer',
  'Samsung Galaxy S24',
  'Air fryer 4 litre',
  'Yoga mat non slip',
]

const aiSuggestions = [
  { label: 'Find wireless earbuds under ₹2000', icon: '🎧' },
  { label: 'Best laptop for students', icon: '💻' },
  { label: 'Cotton shirts for summer', icon: '👕' },
  { label: 'Skincare routine for oily skin', icon: '💆' },
]

export default function Header({ onCommandPalette, onLoginClick }: HeaderProps) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { cartCount } = useCart()
  const { wishlist } = useWishlist()

  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [visualSearchOpen, setVisualSearchOpen] = useState(false)
  const [listening, setListening] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const wishlistCount = wishlist.length
  const notifCount = 2

  // Voice search
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice search not supported in this browser.'); return }
    const recog = new SpeechRecognition()
    recog.lang = 'en-IN'
    recog.interimResults = true
    recog.onstart = () => setListening(true)
    recog.onend = () => setListening(false)
    recog.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setSearchValue(transcript)
    }
    recog.start()
  }

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchFocused(false)
    }
  }

  // Close search on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filteredTrending = searchValue
    ? trendingSearches.filter((s) => s.toLowerCase().includes(searchValue.toLowerCase())).slice(0, 4)
    : trendingSearches.slice(0, 4)

  const closePanels = () => { setWishlistOpen(false); setCartOpen(false); setNotifOpen(false); setVisualSearchOpen(false) }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.09)' }}>

      {/* ── Top Bar ── */}
      <div className="bg-white" style={{ height: 72 }}>
        <div className="max-w-[1560px] mx-auto h-full flex items-center" style={{ padding: '0 20px', gap: 12 }}>

          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-0" onClick={closePanels}>
            <span className="text-[26px] font-extrabold tracking-tight leading-none" style={{ color: '#E40046', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>snap</span>
            <span className="text-[26px] font-extrabold tracking-tight leading-none text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>deal</span>
            <div className="w-2 h-2 rounded-full mb-5 ml-0.5" style={{ backgroundColor: '#E40046' }} />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 relative" ref={searchRef} style={{ maxWidth: '52%', marginLeft: 16, marginRight: 12 }}>
            <div
              className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
              style={{
                border: searchFocused ? '2px solid #E40046' : '2px solid #e2e8f0',
                boxShadow: searchFocused ? '0 0 0 4px rgba(228,0,70,0.07)' : 'none',
                height: 48,
                backgroundColor: '#f8fafc',
              }}
            >
              <div className="flex items-center pl-4 pr-3 h-full border-r border-gray-200 shrink-0">
                <SearchIcon size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Search for products, brands and more...'
                className="flex-1 px-3 text-[14px] font-medium text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              <div className="flex items-center gap-0.5 pr-2 shrink-0">
                <button title={listening ? 'Listening…' : 'Voice Search'} onClick={startVoiceSearch}
                  className="p-2 rounded-lg transition-all hover:bg-red-50"
                  style={{ color: listening ? '#E40046' : '#9ca3af' }}>
                  <MicIcon size={16} />
                </button>
                <button
                  type="button"
                  title="Visual Search (Camera / Upload)"
                  onClick={() => {
                    setSearchFocused(false)
                    setVisualSearchOpen(true)
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#E40046] transition-all cursor-pointer"
                >
                  <CameraIcon size={16} />
                </button>
              </div>
              <button
                onClick={handleSearch}
                className="px-5 py-2 font-bold text-white text-[14px] hover:opacity-90 transition-all shrink-0"
                style={{ backgroundColor: '#E40046', height: '100%', borderLeft: '1px solid #cc003e' }}
              >
                Search
              </button>
            </div>

            {/* Search Dropdown */}
            {searchFocused && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-2xl z-50 overflow-hidden"
                style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.12)', border: '1px solid #f0f0f0' }}>
                
                {/* Visual Search Banner */}
                <div className="px-4 py-3 bg-gradient-to-r from-red-50/90 via-pink-50/60 to-orange-50/60 border-b border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E40046] text-white flex items-center justify-center text-sm shrink-0 shadow-sm">
                      <CameraIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 leading-tight">Visual Search with Camera</p>
                      <p className="text-[11px] text-gray-500">Take a photo or upload an image to find products</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFocused(false)
                      setVisualSearchOpen(true)
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#E40046] hover:bg-red-600 text-white text-[11px] font-extrabold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Open Camera
                  </button>
                </div>

                <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon size={13} className="text-[#E40046]" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">AI Suggestions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {aiSuggestions.map((s) => (
                      <button key={s.label} onClick={() => { setSearchValue(s.label); setSearchFocused(false); navigate(`/search?q=${encodeURIComponent(s.label)}`) }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-red-50 transition-all"
                        style={{ border: '1px solid #f5f5f5' }}>
                        <span className="text-base">{s.icon}</span>
                        <span className="text-[13px] font-medium text-gray-600">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-50">
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><ClockIcon size={11} />Recent</p>
                    {recentSearches.map((s) => (
                      <button key={s} onClick={() => { setSearchValue(s); setSearchFocused(false); navigate(`/search?q=${encodeURIComponent(s)}`) }}
                        className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-all">
                        <ClockIcon size={12} className="text-gray-300 shrink-0" />
                        <span className="text-[13px] text-gray-600 truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><TrendingIcon size={11} className="text-[#E40046]" />Trending</p>
                    {filteredTrending.map((s, i) => (
                      <button key={s} onClick={() => { setSearchValue(s); setSearchFocused(false); navigate(`/search?q=${encodeURIComponent(s)}`) }}
                        className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-all">
                        <span className="text-[11px] font-extrabold w-4 shrink-0" style={{ color: i < 3 ? '#E40046' : '#bbb' }}>{i + 1}</span>
                        <span className="text-[13px] text-gray-600 truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: '#fff9fa', borderTop: '1px solid #fce7f3', borderRadius: '0 0 16px 16px' }}>
                  <SparklesIcon size={12} className="text-[#E40046]" />
                  <p className="text-[12px] text-gray-500">Try: <span className="text-[#E40046] font-semibold">"Best smartphone under ₹20,000 with great camera"</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Deliver to */}
          <button className="hidden xl:flex flex-col items-start px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-all group shrink-0">
            <span className="text-[10px] text-gray-400 font-medium">Deliver to</span>
            <div className="flex items-center gap-1">
              <MapPinIcon size={12} style={{ color: '#E40046' }} />
              <span className="text-[13px] font-bold text-gray-800 group-hover:text-[#E40046] transition-colors">Bengaluru</span>
              <ChevronDownIcon size={11} className="text-gray-400" />
            </div>
          </button>

          <div className="hidden xl:block w-px h-8 bg-gray-100 mx-1 shrink-0" />

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">

            {/* Wishlist */}
            <NavBtn label="Wishlist" badge={wishlistCount} onClick={() => { setWishlistOpen(!wishlistOpen); setCartOpen(false); setNotifOpen(false) }}>
              <HeartIcon size={20} />
            </NavBtn>

            {/* Cart */}
            <NavBtn label="Cart" badge={cartCount} onClick={() => { setCartOpen(!cartOpen); setWishlistOpen(false); setNotifOpen(false) }}>
              <CartIcon size={20} />
            </NavBtn>

            {/* Alerts */}
            <NavBtn label="Alerts" badge={notifCount} onClick={() => { setNotifOpen(!notifOpen); setWishlistOpen(false); setCartOpen(false) }}>
              <BellIcon size={20} />
            </NavBtn>

            <div className="w-px h-8 bg-gray-100 mx-1 shrink-0" />

            {/* Login / Profile */}
            <div className="hidden lg:flex items-center gap-1 border-l border-gray-200 pl-4 ml-2">
              {user ? (
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-[14px]" style={{ backgroundColor: '#E40046' }}>
                      {user.user_metadata?.first_name?.[0] || user.email?.[0].toUpperCase()}
                    </div>
                    <div className="hidden xl:block">
                      <p className="text-[13px] font-semibold text-gray-800 leading-none">{user.user_metadata?.first_name || 'User'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium">My Account</p>
                    </div>
                  </div>
                  {/* Dropdown Profile Menu */}
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden pt-2 pb-2">
                    <Link to="/dashboard" className="block px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 font-medium">My Orders</Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-[14px] text-gray-700 hover:bg-gray-50 font-medium">My Wishlist</Link>
                    <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 font-medium">Sign Out</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors" onClick={onLoginClick}>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <UserIcon size={18} />
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-[13px] font-semibold text-gray-800 leading-none">Sign In</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Account</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ctrl+K */}
            <button onClick={onCommandPalette}
              className="hidden 2xl:flex items-center gap-1 px-2 py-1.5 ml-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              title="Command Palette (Ctrl+K)"
              style={{ border: '1px solid #f0f0f0' }}>
              <kbd className="text-[10px] font-bold">⌘K</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Panels */}
      <WishlistPanel open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <VisualSearchModal open={visualSearchOpen} onClose={() => setVisualSearchOpen(false)} />
    </header>
  )
}

function NavBtn({ label, badge, onClick, children }: { label: string; badge?: number; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="relative flex flex-col items-center px-3 py-2 rounded-xl text-gray-500 hover:text-[#E40046] hover:bg-gray-50 transition-all group"
      style={{ gap: 2 }}>
      <div className="relative">
        {children}
        {badge && badge > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#E40046' }}>
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-semibold group-hover:text-[#E40046]">{label}</span>
    </button>
  )
}

import React from 'react'
