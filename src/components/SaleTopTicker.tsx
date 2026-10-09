import { useState, useEffect } from 'react'

interface SaleTopTickerProps {
  onOpenEntrance: () => void
}

export default function SaleTopTicker({ onOpenEntrance }: SaleTopTickerProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 4, m: 28, s: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 }
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 }
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 }
        return { h: 6, m: 0, s: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedHours = String(timeLeft.h).padStart(2, '0')
  const formattedMinutes = String(timeLeft.m).padStart(2, '0')
  const formattedSeconds = String(timeLeft.s).padStart(2, '0')

  const items = [
    '🔥 MYNTRA-STYLE BIG FASHION FESTIVAL IS LIVE',
    '⚡ 50% – 80% OFF ON 15,000+ STYLES',
    '🎁 EXTRA ₹500 OFF ON FIRST PURCHASE • CODE: FESTIVAL50',
    '🚚 FREE DELIVERY ACROSS INDIA TODAY',
    '💸 100% CASH ON DELIVERY (COD) AVAILABLE',
    '✨ EXTRA 15% OFF WITH HDFC & AXIS CARDS',
    `⏰ GRAND SALE ENDS IN ${formattedHours}h : ${formattedMinutes}m : ${formattedSeconds}s`,
  ]

  return (
    <aside
      aria-label="Festival sale announcement"
      className="relative z-40 overflow-hidden text-white cursor-pointer select-none border-b border-rose-400/30"
      style={{
        background: 'linear-gradient(90deg, #1f0b2e 0%, #E40046 35%, #ff4b2b 70%, #2b0845 100%)',
        boxShadow: '0 2px 14px rgba(228, 0, 70, 0.35)',
      }}
      onClick={onOpenEntrance}
    >
      <div className="max-w-[1440px] mx-auto px-4 py-1.5 flex items-center justify-between gap-4 text-[12px] font-bold">
        {/* Left Live Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] tracking-wider font-extrabold uppercase text-amber-200 border border-amber-300/40">
            GRAND SALE LIVE
          </span>
        </div>

        {/* Center Marquee */}
        <div className="flex-1 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 py-0.5">
            {items.concat(items).map((text, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-white/95 font-semibold text-[11px] sm:text-[12px] tracking-wide">
                <span>{text}</span>
                <span className="text-amber-300 text-[10px] font-black">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1 font-mono text-[11px] text-amber-200 bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
            <span>⏱️ {formattedHours}:{formattedMinutes}:{formattedSeconds}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenEntrance()
            }}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-gray-950 rounded-full font-extrabold text-[11px] transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1"
          >
            <span>ENTER SALE</span>
            <span className="text-[12px]">🎟️</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
