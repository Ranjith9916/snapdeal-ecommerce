import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClockIcon, HeartIcon, CartIcon } from './Icons'
import { getProductById, getProducts, ProductModel } from '../services/products'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'

const STORAGE_KEY = 'snapdeal_recently_viewed'

export function trackProductView(id: string | number) {
  try {
    const idStr = String(id)
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const updated = [idStr, ...existing.filter(x => x !== idStr)].slice(0, 8)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

const recentSearches = [
  'wireless earphones',
  'macbook pro',
  'running shoes',
  'face serum',
  'smart watch',
]

export default function RecentlyViewed() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductModel[]>([])
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadRecentlyViewed() {
      try {
        const rawIds: (string | number)[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        const validIds = rawIds.map(String).filter(id => id.length > 5) // filter out old numeric dummy IDs

        if (validIds.length > 0) {
          const loaded = await Promise.all(validIds.slice(0, 4).map(id => getProductById(id)))
          const found = loaded.filter(Boolean) as ProductModel[]
          if (found.length > 0) {
            setProducts(found)
            return
          }
        }
      } catch (err) {
        console.error('Error reading recently viewed', err)
      }

      // Default to top 4 products from catalog
      const fallback = await getProducts({ limit: 4 })
      setProducts(fallback)
    }

    loadRecentlyViewed()
  }, [])

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    getProducts({ limit: 4 }).then(setProducts)
  }

  if (products.length === 0) return null

  return (
    <div className="mb-10">
      {/* Recent searches */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <ClockIcon size={16} className="text-gray-400" />
          <h3 className="text-[14px] font-bold text-gray-700">Recent Searches</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((s) => (
            <button key={s} onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
              className="px-4 py-1.5 rounded-full text-[12px] font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:border-[#E40046] hover:text-[#E40046] hover:bg-red-50 transition-all">
              🔍 {s}
            </button>
          ))}
        </div>
      </div>

      {/* Recently viewed */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-gray-900">Recently Viewed</h2>
        <button onClick={clearHistory} className="text-[12px] font-semibold text-gray-400 hover:text-[#E40046] transition-colors">
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((p) => {
          const isWishlisted = isInWishlist(p.id)
          const img = p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
          const origPrice = p.original_price || p.price

          return (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden group transition-all hover:-translate-y-0.5 flex flex-col"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
              <Link to={`/product/${p.id}`} className="relative block bg-gray-50 overflow-hidden" style={{ height: 160 }}>
                <img src={img} alt={p.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                <button
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (isWishlisted) removeFromWishlist(p.id)
                    else addToWishlist(p.id)
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  style={{ border: '1px solid #f0f0f0' }}>
                  <HeartIcon size={13} fill={isWishlisted ? '#E40046' : 'none'} stroke={isWishlisted ? '#E40046' : '#999'} />
                </button>
              </Link>
              <div className="p-3 flex flex-col flex-1">
                {p.brand && (
                  <p className="text-[10px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: '#E40046' }}>{p.brand}</p>
                )}
                <Link to={`/product/${p.id}`}>
                  <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 mb-1.5 hover:text-[#E40046] transition-colors">{p.name}</p>
                </Link>
                <div className="flex items-baseline gap-1.5 mb-2 mt-auto">
                  <span className="text-[14px] font-extrabold text-gray-900">₹{p.price.toLocaleString()}</span>
                  {origPrice > p.price && (
                    <span className="text-[11px] text-gray-400 line-through">₹{origPrice.toLocaleString()}</span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(p.id, 1)}
                  className="w-full py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1 hover:opacity-90 active:scale-95 transition-all"
                  style={{ backgroundColor: '#E40046' }}>
                  <CartIcon size={11} /> Add to Cart
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
