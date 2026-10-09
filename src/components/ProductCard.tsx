import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon, CartIcon, StarIcon } from './Icons'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'

export interface Product {
  id: string
  title: string
  image: string
  images?: string[]
  rating: number
  reviews: number
  price: number
  originalPrice: number
  discount: number
  badge?: string
  brand?: string
  delivery?: string
  cod?: boolean
  stock?: number
}

interface ProductCardProps {
  product: Product
  compact?: boolean
}

const QuickViewIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

const ShareIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)

export default function ProductCard({ product, compact }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const [boughtNow, setBoughtNow] = useState(false)
  const [imgHovered, setImgHovered] = useState(false)
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const isWished = isInWishlist(product.id)

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format']

  const currentDisplayIdx = imgHovered && activeImgIdx === 0 && imagesList.length > 1 ? 1 : activeImgIdx
  const activeImage = imagesList[currentDisplayIdx] || imagesList[0]

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWished) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    const { success } = await addToCart(product.id, 1)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    }
  }

  const ratingColor = product.rating >= 4 ? '#22c55e' : product.rating >= 3 ? '#f97316' : '#ef4444'

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      style={{
        boxShadow: '0 1px 12px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef',
      }}
    >
      {/* Image area */}
      <Link to={`/product/${product.id}`} className="block relative" style={{ height: compact ? 160 : 210 }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => {
          setImgHovered(false)
          setActiveImgIdx(0)
        }}>
        <div className="w-full h-full flex items-center justify-center overflow-hidden bg-gray-50">
          <img
            src={activeImage}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format';
            }}
            className="w-full h-full object-contain transition-transform duration-400 p-2"
            style={{ transform: imgHovered ? 'scale(1.06)' : 'scale(1)' }}
          />
        </div>

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="px-2 py-0.5 text-white text-[10px] font-extrabold rounded-md" style={{ backgroundColor: '#E40046' }}>
            {product.discount}% off
          </span>
          {product.badge && (
            <span className="px-2 py-0.5 text-white text-[10px] font-extrabold rounded-md bg-orange-500">
              {product.badge}
            </span>
          )}
        </div>

        {/* Real-world Multi-Style Perspective Pill */}
        {imagesList.length > 1 && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[9px] font-bold text-gray-700 bg-white/95 backdrop-blur-sm rounded-md shadow-xs border border-gray-200/80 flex items-center gap-1 z-10">
            {imagesList.length} Styles
          </span>
        )}

        {/* Real-world Style Scrubber Dots */}
        {imagesList.length > 1 && imgHovered && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
            {imagesList.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveImgIdx(idx)
                }}
                onMouseEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveImgIdx(idx)
                }}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentDisplayIdx === idx ? 'w-3.5 bg-[#E40046]' : 'w-1.5 bg-gray-400/80 hover:bg-gray-700'
                }`}
                title={`Style ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
          style={{ border: '1px solid #f0f0f0', opacity: imgHovered || isWished ? 1 : 0.85 }}
        >
          <HeartIcon size={15} fill={isWished ? '#E40046' : 'none'} stroke={isWished ? '#E40046' : '#666'} />
        </button>

        {/* Bottom hover actions */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 pb-2 transition-all duration-200 z-10"
          style={{ opacity: imgHovered && imagesList.length <= 1 ? 1 : 0, transform: imgHovered ? 'translateY(0)' : 'translateY(6px)' }}
        >
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
            <QuickViewIcon /> Quick View
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
            <ShareIcon /> Share
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#E40046' }}>
            {product.brand}
          </p>
        )}

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <p className="text-[13px] font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 hover:text-[#E40046] transition-colors">
            {product.title}
          </p>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-white text-[11px] font-bold"
            style={{ backgroundColor: ratingColor }}>
            <StarIcon size={9} fill="white" stroke="none" />
            {product.rating}
          </div>
          <span className="text-[11px] text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2 mt-auto">
          <span className="text-[16px] font-extrabold text-gray-900">₹{product.price.toLocaleString()}</span>
          <span className="text-[12px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          <span className="text-[11px] font-bold text-green-600">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
        </div>

        {/* Delivery */}
        {product.delivery && (
          <p className="text-[11px] text-gray-500 mb-2">
            🚚 <span className="font-semibold">{product.delivery}</span>
          </p>
        )}

        {/* COD badge */}
        {product.cod && (
          <span className="inline-block text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md mb-2 border border-green-100">
            Cash on Delivery
          </span>
        )}

        {/* Stock warning */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="text-[11px] font-bold text-orange-600 mb-1.5">Only {product.stock} left!</p>
        )}

        {/* Add to Cart + Buy Now */}
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 py-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: added ? '#22c55e' : '#E40046',
              color: '#fff',
              boxShadow: added ? '0 2px 8px rgba(34,197,94,0.3)' : '0 2px 8px rgba(228,0,70,0.2)',
            }}
          >
            <CartIcon size={13} />
            {added ? '✓ Added' : 'Add to Cart'}
          </button>
          <Link to={`/product/${product.id}`} className="flex-1">
            <button
              onClick={() => { setBoughtNow(true); setTimeout(() => setBoughtNow(false), 1200) }}
              className="w-full py-2 rounded-xl text-[12px] font-bold flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                border: '1.5px solid #E40046',
                color: boughtNow ? '#fff' : '#E40046',
                backgroundColor: boughtNow ? '#E40046' : 'transparent',
              }}
            >
              Buy Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
