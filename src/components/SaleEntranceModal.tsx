import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './Toast'

interface SaleEntranceModalProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export default function SaleEntranceModal({ isOpen, onClose, onOpen }: SaleEntranceModalProps) {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 })

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 6, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCopyCoupon = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    navigator.clipboard?.writeText('FESTIVAL50')
    setCopied(true)
    addToast('Coupon FESTIVAL50 copied! Flat ₹500 OFF applied to your checkout.', 'success')
    setTimeout(() => setCopied(false), 3000)
  }

  const handleEnterSale = (route = '/search?cat=deals') => {
    onClose()
    navigate(route)
  }

  const stealDoors = [
    {
      title: "Women's Fashion",
      subtitle: 'Sarees, Kurta Sets & Dresses',
      badge: 'FLAT 70% OFF',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop&auto=format',
      link: '/search?cat=womens',
      gradient: 'from-pink-500/20 to-purple-500/30',
      accent: '#ec4899',
    },
    {
      title: "Men's Trend Hub",
      subtitle: 'Shirts, Jeans & Jackets',
      badge: 'UNDER ₹799',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop&auto=format',
      link: '/search?cat=mens',
      gradient: 'from-blue-500/20 to-indigo-500/30',
      accent: '#3b82f6',
    },
    {
      title: 'Footwear & Sneakers',
      subtitle: 'Nike, Puma, Bata & Woodland',
      badge: 'BUY 1 GET 1 FREE',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format',
      link: '/search?cat=footwear',
      gradient: 'from-amber-500/20 to-rose-500/30',
      accent: '#f59e0b',
    },
    {
      title: 'Luxury Watches & Tech',
      subtitle: 'Titan, Fastrack, Fossil & Audio',
      badge: 'MIN 60% OFF',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop&auto=format',
      link: '/search?cat=watches',
      gradient: 'from-purple-500/20 to-pink-500/30',
      accent: '#a855f7',
    },
  ]

  return (
    <>
      {/* Floating launcher trigger if closed */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-20 z-40 px-4 py-2.5 rounded-full text-white font-extrabold text-[12px] flex items-center gap-2.5 shadow-2xl transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #E40046 0%, #ff5252 50%, #f59e0b 100%)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
          }}
          title="Open Grand Sale Entrance"
        >
          <span className="text-[16px] animate-spin" style={{ animationDuration: '6s' }}>🎊</span>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] text-amber-200 tracking-wider font-mono">FESTIVAL LIVE</span>
            <span className="text-[12px] font-black tracking-wide">80% OFF SALE</span>
          </div>
        </button>
      )}

      {/* Main Entrance Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="grand-sale-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          style={{
            backgroundColor: 'rgba(12, 4, 22, 0.88)',
            backdropFilter: 'blur(16px)',
          }}
          onClick={onClose}
        >
          {/* Main Container Card */}
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden text-white shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-300"
            style={{
              background: 'linear-gradient(145deg, #1b072c 0%, #290a3a 40%, #150522 100%)',
              border: '2px solid rgba(255, 215, 0, 0.35)',
              boxShadow: '0 0 60px rgba(228, 0, 70, 0.4), 0 0 100px rgba(255, 174, 51, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Decorative Neon Radial Auroras */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            
            {/* Sparkling Star Elements */}
            <div className="absolute top-6 left-8 text-amber-300 text-lg animate-float-slow select-none">✦</div>
            <div className="absolute top-12 right-16 text-pink-400 text-xl animate-float-slow select-none" style={{ animationDelay: '1s' }}>★</div>
            <div className="absolute bottom-12 left-12 text-yellow-300 text-base animate-float-slow select-none" style={{ animationDelay: '2s' }}>✦</div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/20"
              aria-label="Close Entrance"
            >
              ✕
            </button>

            {/* Header / Announcement Hero Section */}
            <div className="relative pt-8 pb-5 px-6 sm:px-10 text-center border-b border-white/10">
              {/* Grand Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-pink-500/30 border border-amber-400/50 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest shadow-inner mb-3">
                <span>👑</span>
                <span>BIG FASHION FESTIVAL • SNAPDEAL MEGA GRAND SALE</span>
                <span>✨</span>
              </div>

              {/* Mega Title */}
              <h1 id="grand-sale-title" className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-rose-300 to-amber-100">
                  THE CRAZIEST SALE
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400">
                  50% TO 80% OFF
                </span>
              </h1>
              <p className="text-white/80 text-xs sm:text-sm font-medium max-w-lg mx-auto">
                India’s largest festive fashion & lifestyle extravaganza with 10,000+ top styles, free shipping, and doorstep COD.
              </p>

              {/* Live Urgency Countdown Timer */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mt-5">
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-widest self-center mr-1">
                  ⚡ ENDS IN:
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-center min-w-[50px]">
                    <span className="text-lg sm:text-xl font-extrabold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="block text-[8px] text-white/60 font-sans uppercase">HRS</span>
                  </div>
                  <span className="text-amber-400 font-bold text-lg">:</span>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-center min-w-[50px]">
                    <span className="text-lg sm:text-xl font-extrabold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="block text-[8px] text-white/60 font-sans uppercase">MIN</span>
                  </div>
                  <span className="text-amber-400 font-bold text-lg">:</span>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-center min-w-[50px]">
                    <span className="text-lg sm:text-xl font-extrabold text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="block text-[8px] text-white/60 font-sans uppercase">SEC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Steal Doors: 4 Category Portals */}
            <div className="px-6 sm:px-10 py-6">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🚪</span> STEAL DOORS: PICK YOUR ENTRY CATEGORY
                </span>
                <span className="text-[11px] text-white/60 font-medium">Extra 10% Instant Cash Discount</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stealDoors.map((door, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleEnterSale(door.link)}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-white/15 bg-white/5 backdrop-blur-sm"
                  >
                    {/* Image View */}
                    <div className="h-32 sm:h-36 overflow-hidden relative">
                      <img
                        src={door.image}
                        alt={door.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span
                        className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-md uppercase tracking-wider"
                        style={{ backgroundColor: door.accent }}
                      >
                        {door.badge}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 bg-black/40">
                      <h4 className="text-[12px] sm:text-[13px] font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
                        {door.title}
                      </h4>
                      <p className="text-[10px] text-white/70 truncate mt-0.5">{door.subtitle}</p>
                      <div className="mt-2 text-[10px] font-bold text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore Deals →
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* VIP Voucher / Coupon Scratch Card */}
              <div
                className="mt-6 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-400/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(228, 0, 70, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%)',
                }}
              >
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-2xl shrink-0">
                    🎟️
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-xs font-bold text-amber-300 uppercase">EXCLUSIVE FIRST-ORDER VOUCHER</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-green-500 text-white rounded">ACTIVE</span>
                    </div>
                    <p className="text-white text-sm sm:text-base font-extrabold mt-0.5">
                      Flat ₹500 OFF On Orders Above ₹999 + Free Delivery
                    </p>
                    <p className="text-white/60 text-[11px]">Valid on Men, Women, Footwear & Traditional Collections</p>
                  </div>
                </div>

                {/* Coupon Code Pill */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-4 py-2 rounded-xl bg-black/60 border border-amber-300/60 font-mono text-amber-300 font-extrabold text-sm tracking-wider">
                    FESTIVAL50
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {copied ? '✓ COPIED!' : 'COPY CODE'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="px-6 sm:px-10 py-5 bg-black/50 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-[11px] text-white/70 font-medium">
                <span className="flex items-center gap-1">🚚 <b>Free Delivery</b></span>
                <span className="flex items-center gap-1">💸 <b>Cash on Delivery</b></span>
                <span className="flex items-center gap-1">🔄 <b>7-Day Easy Returns</b></span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-white/70 hover:text-white text-xs font-semibold hover:bg-white/5 transition-all text-center"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => handleEnterSale('/search?cat=deals')}
                  className="flex-1 sm:flex-none px-7 py-3 rounded-xl text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2 animate-pulse-glow"
                  style={{
                    background: 'linear-gradient(135deg, #E40046 0%, #ff4b2b 100%)',
                  }}
                >
                  <span>ENTER THE GRAND SALE</span>
                  <span>🛍️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
