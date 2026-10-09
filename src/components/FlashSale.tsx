import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ZapIcon, HeartIcon, CartIcon, StarIcon } from './Icons'
import { getProducts, ProductModel } from '../services/products'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'

function useCountdown(h: number, m: number, s: number) {
  const [t, setT] = useState({ h, m, s })
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        if (p.s > 0) return { ...p, s: p.s - 1 }
        if (p.m > 0) return { ...p, m: p.m - 1, s: 59 }
        if (p.h > 0) return { h: p.h - 1, m: 59, s: 59 }
        return p
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

// Fallback deals removed. We fetch directly from Supabase.

function TimeUnit({ val, label }: { val: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 flex items-center justify-center rounded-2xl text-white font-extrabold text-2xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        {String(val).padStart(2, '0')}
      </div>
      <span className="text-[10px] font-bold text-white/60 mt-1 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function FlashCard({ deal }: { deal: ProductModel }) {
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const isWished = isInWishlist(deal.id)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWished) {
      removeFromWishlist(deal.id)
    } else {
      addToWishlist(deal.id)
    }
  }

  const handleAddToCart = async () => {
    const { success } = await addToCart(deal.id, 1)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }
  
  // Simulated stock logic for flash sale UI based on db stock_quantity
  const totalStock = deal.stock_quantity > 0 ? deal.stock_quantity * 3 : 50
  const sold = totalStock - deal.stock_quantity
  const soldPct = Math.round((sold / totalStock) * 100) || 0
  const isAlmostGone = deal.stock_quantity <= 6 && deal.stock_quantity > 0
  const viewing = Math.floor(Math.random() * 200) + 50
  const img = deal.images && deal.images.length > 0 ? deal.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format'
  // Mock rating/reviews since it's not in products table
  const rating = 4.5
  const reviews = 1200

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden group flex flex-col transition-all duration-250 hover:-translate-y-1"
      style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.08)', border: isAlmostGone ? '1.5px solid #fca5a5' : '1px solid #f0f0f0' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 180, backgroundColor: '#f8f8f8' }}>
        <Link to={`/product/${deal.id}`}>
          <img src={img} alt={deal.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-2.5 py-1 text-white text-[10px] font-extrabold rounded-full" style={{ backgroundColor: '#E40046' }}>
            ⚡ {deal.discount}% OFF
          </span>
          {isAlmostGone && (
            <span className="px-2.5 py-1 text-white text-[10px] font-extrabold rounded-full bg-orange-500">
              🔥 Almost Gone
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <HeartIcon size={15} fill={isWished ? '#E40046' : 'none'} stroke={isWished ? '#E40046' : '#999'} />
        </button>

        {/* Viewing bubble */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] font-bold text-white tracking-wider">{viewing} viewing</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${deal.id}`}>
          <h3 className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {deal.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-white text-[10px] font-bold bg-green-600">
              <StarIcon size={10} fill="white" stroke="none" /> {rating}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">({reviews.toLocaleString()})</span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[20px] font-extrabold text-gray-900">₹{deal.price.toLocaleString()}</span>
            <span className="text-[12px] text-gray-400 line-through font-medium">₹{deal.original_price.toLocaleString()}</span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-bold mb-1.5">
              <span className="text-[#E40046]">{soldPct}% Claimed</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${soldPct}%`, backgroundColor: isAlmostGone ? '#ef4444' : '#E40046' }}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: added ? '#22c55e' : '#E40046', color: '#fff' }}
        >
          <CartIcon size={13} />
          {added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

export default function FlashSale() {
  const timeLeft = useCountdown(4, 35, 12)
  const [deals, setDeals] = useState<ProductModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDeals() {
      const data = await getProducts({ limit: 4 })
      setDeals(data)
      setLoading(false)
    }
    loadDeals()
  }, [])

  if (loading) {
    return (
      <div className="mb-10 p-6 rounded-3xl" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
        <h2 className="text-white text-xl animate-pulse">Loading Flash Deals...</h2>
      </div>
    )
  }

  // Handle empty database explicitly
  if (deals.length === 0) {
    return (
      <div className="mb-10 p-10 rounded-3xl text-center" style={{ border: '2px dashed #e5e7eb' }}>
        <h2 className="text-gray-500 text-lg font-semibold">No flash sale products available.</h2>
        <p className="text-gray-400 text-sm mt-2">Seed data is required in the Supabase database to display this section.</p>
      </div>
    )
  }

  return (
    <div className="mb-10 p-6 sm:p-8 rounded-[32px] relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
      {/* Hero header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
              <ZapIcon size={22} fill="white" stroke="none" />
            </div>
            <div>
              <p className="text-white font-extrabold text-xl tracking-tight leading-none">Flash Sale</p>
              <p className="text-red-200 text-[11px] font-semibold mt-0.5">Limited stock · Exclusive prices</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm font-semibold mr-1">Ends in</span>
            <TimeUnit val={timeLeft.h} label="hrs" />
            <span className="text-white font-extrabold text-2xl mb-5">:</span>
            <TimeUnit val={timeLeft.m} label="min" />
            <span className="text-white font-extrabold text-2xl mb-5">:</span>
            <TimeUnit val={timeLeft.s} label="sec" />
          </div>
        </div>

        <div className="flex flex-col gap-2 text-right shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-white font-extrabold text-[18px]">12,863</p>
              <p className="text-white/60 text-[10px] font-semibold">Items Sold Today</p>
            </div>
            <div className="text-center">
              <p className="text-white font-extrabold text-[18px] flex items-center gap-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" style={{ animation: 'pulse 1.5s infinite' }} />527
              </p>
              <p className="text-white/60 text-[10px] font-semibold">People Viewing</p>
            </div>
          </div>
          <Link to="/search?cat=deals" className="self-end">
            <button className="px-5 py-2 rounded-xl font-bold text-[13px] transition-all hover:scale-105" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              View All Deals →
            </button>
          </Link>
        </div>
      </div>

      {/* Horizontal scrolling carousel */}
      <div
        className="rounded-b-2xl"
        style={{ backgroundColor: '#fff9fa', border: '1px solid #ffe0e8', borderTop: 'none', padding: '16px 20px' }}
      >
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
        >
          {deals.map((d) => (
            <div key={d.id} className="shrink-0" style={{ width: 220 }}>
              <FlashCard deal={d} />
            </div>
          ))}
          {/* View All card */}
          <div className="shrink-0 flex items-center justify-center" style={{ width: 160 }}>
            <Link
              to="/search?cat=deals"
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl text-center hover:scale-105 transition-all w-full h-full"
              style={{ background: 'linear-gradient(135deg, #E40046, #c9003c)', color: '#fff', minHeight: 280 }}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">→</div>
              <p className="font-extrabold text-[15px]">View All Flash Deals</p>
              <p className="text-white/70 text-[11px]">100+ products on sale</p>
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}
