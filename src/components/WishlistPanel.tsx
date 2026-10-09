import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CloseIcon, CartIcon, SparklesIcon } from './Icons'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'

const folders = ['All', 'Electronics', 'Fashion', 'Home', 'Gifts 🎁']

interface WishlistPanelProps {
  open: boolean
  onClose: () => void
}

export default function WishlistPanel({ open, onClose }: WishlistPanelProps) {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [activeFolder, setActiveFolder] = useState('All')
  const [movingAll, setMovingAll] = useState(false)

  const filtered = wishlist.filter(
    (i) => (activeFolder === 'All' || i.folder_name === activeFolder)
  )

  if (!open) return null

  const handleMoveAll = async () => {
    setMovingAll(true)
    for (const item of filtered) {
      await addToCart(item.product_id, 1)
    }
    setMovingAll(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ top: 72 }} onClick={onClose} />
      <div
        className="fixed z-50 bg-white flex flex-col"
        style={{
          top: 76,
          right: 24,
          width: 420,
          maxHeight: 600,
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.16)',
          border: '1px solid #f0f0f0',
          animation: 'panelIn 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
          <div>
            <p className="font-bold text-gray-900 text-[16px]">My Wishlist</p>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">{wishlist.length} saved items</p>
          </div>
          <div className="flex items-center gap-2">
            {filtered.length > 0 && (
              <button
                onClick={handleMoveAll}
                disabled={movingAll}
                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-red-50 text-[#E40046] hover:bg-[#E40046] hover:text-white transition-all disabled:opacity-50"
              >
                {movingAll ? 'Moving...' : 'Move All to Cart'}
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        {/* AI insight */}
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl flex items-start gap-2.5" style={{ backgroundColor: '#fff5f7', border: '1px solid #fce7f3' }}>
          <SparklesIcon size={14} className="text-[#E40046] shrink-0 mt-0.5" />
          <p className="text-[12px] font-medium text-gray-700 leading-relaxed">
            <span className="font-bold text-[#E40046]">AI Wishlist:</span> Prices on your saved electronics and fashion items are at their lowest this week!
          </p>
        </div>

        {/* Folder tabs */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
              style={{
                backgroundColor: activeFolder === f ? '#E40046' : '#f5f5f5',
                color: activeFolder === f ? '#fff' : '#555',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {filtered.map((item) => {
            const p = item.products || {}
            const img = p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'
            const price = Number(p.price) || 0
            const originalPrice = Number(p.original_price) || price
            const discount = p.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)

            return (
              <div
                key={item.id || item.product_id}
                className="flex gap-3 p-3 rounded-2xl group transition-all hover:shadow-md"
                style={{ border: '1px solid #f0f0f0' }}
              >
                <div className="relative shrink-0">
                  <Link to={`/product/${item.product_id}`} onClick={onClose}>
                    <img src={img} alt={p.name || 'Product'} className="w-20 h-20 object-cover rounded-xl" />
                  </Link>
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product_id}`} onClick={onClose}>
                    <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-[#E40046] transition-colors">{p.name || 'Product'}</p>
                  </Link>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-[15px] font-extrabold text-gray-900">₹{price.toLocaleString()}</span>
                    {originalPrice > price && (
                      <span className="text-[11px] text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                    )}
                    {discount > 0 && (
                      <span className="text-[11px] font-bold text-green-600">{discount}% off</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => addToCart(item.product_id, 1)}
                      className="flex-1 py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1 hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#E40046' }}
                    >
                      <CartIcon size={11} /> Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      style={{ border: '1px solid #eee' }}
                    >
                      <CloseIcon size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">🤍</p>
              <p className="text-[14px] font-semibold text-gray-600">Your wishlist is empty</p>
              <p className="text-[12px] text-gray-400 mt-1">Tap the heart on any product to save it here</p>
              <Link to="/search" onClick={onClose} className="mt-4 inline-block px-5 py-2 rounded-xl text-white font-bold text-[12px]" style={{ backgroundColor: '#E40046' }}>
                Explore Products
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes panelIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </>
  )
}
