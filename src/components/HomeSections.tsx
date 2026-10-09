import { Link } from 'react-router-dom'
import { HeartIcon, CartIcon } from './Icons'
import { useState, useEffect } from 'react'
import { getProducts, ProductModel } from '../services/products'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'

function HScrollSection({ title, subtitle, emoji, products, viewAll = '/search', accentColor = '#E40046' }: {
  title: string; subtitle?: string; emoji?: string; products: ProductModel[]; viewAll?: string; accentColor?: string
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-6">
        <div>
          <h2 className="text-[22px] font-extrabold text-gray-900 flex items-center gap-2">
            {emoji && <span>{emoji}</span>} {title}
          </h2>
          {subtitle && <p className="text-[13px] text-gray-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <Link to={viewAll} className="text-[13px] font-bold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: accentColor }}>
          See All →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 px-6" style={{ scrollbarWidth: 'none' }}>
        {products.map((p) => <MiniCard key={p.id} product={p} accentColor={accentColor} />)}
      </div>
    </div>
  )
}

function MiniCard({ product: p, accentColor = '#E40046' }: { product: ProductModel; accentColor?: string }) {
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const isWished = isInWishlist(p.id)
  const [added, setAdded] = useState(false)
  const img = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format'
  const rating = 4.5

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWished) {
      removeFromWishlist(p.id)
    } else {
      addToWishlist(p.id)
    }
  }

  const handleAddToCart = async () => {
    const { success } = await addToCart(p.id, 1)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1200)
    }
  }

  return (
    <div
      className="shrink-0 bg-white rounded-2xl overflow-hidden group transition-all duration-200 hover:-translate-y-1"
      style={{ width: 176, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}
    >
      <div className="relative overflow-hidden" style={{ height: 160, backgroundColor: '#f8f8f8' }}>
        <Link to={`/product/${p.id}`}>
          <img src={img} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>
        <span className="absolute top-2 left-2 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ backgroundColor: accentColor }}>
          {p.discount}% off
        </span>
        <button
          onClick={handleWishlistToggle}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <HeartIcon size={13} fill={isWished ? '#E40046' : 'none'} stroke={isWished ? '#E40046' : '#999'} />
        </button>
      </div>
      <div className="p-3">
        <Link to={`/product/${p.id}`}>
          <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2 mb-1.5 hover:text-[#E40046] transition-colors">{p.name}</p>
        </Link>
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: '#22c55e' }}>★ {rating}</span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-[14px] font-extrabold text-gray-900">₹{p.price.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 line-through">₹{p.original_price.toLocaleString()}</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1 transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: added ? '#22c55e' : accentColor }}
        >
          <CartIcon size={11} /> {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

// Brand showcase section
const topBrandItems = [
  { name: 'Apple', logo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=120&h=120&fit=crop&auto=format', bg: '#f5f5f7', count: '2.3K products' },
  { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=120&h=120&fit=crop&auto=format', bg: '#e8f0fe', count: '5.1K products' },
  { name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop&auto=format', bg: '#fff7ed', count: '1.2K products' },
  { name: 'Sony', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop&auto=format', bg: '#f0f9ff', count: '890 products' },
  { name: 'L\'Oreal', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&h=120&fit=crop&auto=format', bg: '#fff5f7', count: '2.8K products' },
  { name: 'Levi\'s', logo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=120&h=120&fit=crop&auto=format', bg: '#eff6ff', count: '1.5K products' },
]

function BrandCard({ brand }: { brand: typeof topBrandItems[0] }) {
  return (
    <Link to={`/search?q=${encodeURIComponent(brand.name)}`} className="shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg group" style={{ width: 140, backgroundColor: brand.bg, border: '1px solid #f0f0f0' }}>
      <div className="w-16 h-16 rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff' }}>
        <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
      </div>
      <p className="text-[13px] font-extrabold text-gray-900 group-hover:text-[#E40046] transition-colors">{brand.name}</p>
      <p className="text-[10px] text-gray-400">{brand.count}</p>
    </Link>
  )
}

export default function HomeSections() {
  const [gamingZone, setGamingZone] = useState<ProductModel[]>([])
  const [officeEssentials, setOfficeEssentials] = useState<ProductModel[]>([])
  const [smartHome, setSmartHome] = useState<ProductModel[]>([])

  useEffect(() => {
    async function load() {
      const all = await getProducts()
      setGamingZone(all.slice(0, 6))
      setOfficeEssentials(all.slice(6, 12))
      setSmartHome(all.slice(12, 18))
    }
    load()
  }, [])

  return (
    <div className="max-w-[1400px] mx-auto pt-6">
      <div className="mb-10 px-6">
        <h2 className="text-[20px] font-extrabold text-gray-900 mb-4">Top Brands</h2>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {topBrandItems.map(b => <BrandCard key={b.name} brand={b} />)}
        </div>
      </div>

      <HScrollSection title="Gaming Zone" subtitle="Level up your setup" emoji="🎮" products={gamingZone} viewAll="/search?q=Gaming" accentColor="#7c3aed" />
      <HScrollSection title="Office Essentials" subtitle="Upgrade your workspace" emoji="💼" products={officeEssentials} viewAll="/search?q=Office" accentColor="#0284c7" />
      <HScrollSection title="Smart Home & Gadgets" subtitle="Make your home intelligent" emoji="🏠" products={smartHome} viewAll="/search?cat=home" accentColor="#059669" />
    </div>
  )
}
