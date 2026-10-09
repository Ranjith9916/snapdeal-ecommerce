import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon, CartIcon, SparklesIcon, BellIcon, CloseIcon } from '../components/Icons'
import Footer from '../components/Footer'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'

const folders = ['All', 'Electronics', 'Fashion', 'Home', 'Gifts 🎁', 'Gaming']

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [activeFolder, setActiveFolder] = useState('All')
  const [selected, setSelected] = useState<string[]>([])

  const filtered = wishlist.filter((i) => activeFolder === 'All' || i.folder_name === activeFolder)
  const toggle = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <HeartIcon size={24} fill="#E40046" stroke="#E40046" />
            <div>
              <h1 className="text-[24px] font-extrabold text-gray-900">My Wishlist</h1>
              <p className="text-[13px] text-gray-400 font-medium">{filtered.length} items saved</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {selected.length > 0 && (
              <>
                <button onClick={async () => {
                  for (const pId of selected) {
                    await addToCart(pId, 1, 'Default')
                  }
                  setSelected([])
                }} className="px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#E40046' }}>
                  Move {selected.length} to Cart
                </button>
                <button onClick={async () => {
                  for (const pId of selected) {
                    await removeFromWishlist(pId)
                  }
                  setSelected([])
                }}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-red-50 hover:text-red-600"
                  style={{ border: '1px solid #eee', color: '#666' }}>
                  Remove Selected
                </button>
              </>
            )}
            <button className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-gray-50"
              style={{ border: '1px solid #eee', color: '#666' }}>
              Share Wishlist 🔗
            </button>
          </div>
        </div>

        {/* AI insight banner */}
        <div className="p-4 rounded-2xl mb-6 flex items-start gap-3" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #fdf4ff 100%)', border: '1px solid #fce7f3' }}>
          <SparklesIcon size={18} className="text-[#E40046] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[14px] text-[#E40046] mb-1">AI Wishlist Intelligence</p>
            <p className="text-[13px] text-gray-700 leading-relaxed">
              Nike Air Max saved <strong>45 days ago</strong> has dropped ₹1,500 and has only 3 left. Samsung Galaxy Watch 6 dropped ₹2,000 — best price seen in 6 months. Act now before they sell out!
            </p>
          </div>
        </div>

        {/* Folder tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {folders.map((f) => (
            <button key={f} onClick={() => setActiveFolder(f)}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
              style={{ backgroundColor: activeFolder === f ? '#E40046' : '#f5f5f5', color: activeFolder === f ? '#fff' : '#555' }}>
              {f}
            </button>
          ))}
          <button className="shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:bg-gray-100"
            style={{ border: '1px dashed #ddd', color: '#999' }}>
            + New List
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => {
            const prod = item.products
            if (!prod) return null
            const priceChange = -100 // mock price change
            const stockStr = prod.stock > 0 ? (prod.stock < 5 ? `Only ${prod.stock} Left` : 'In Stock') : 'Out of Stock'
            
            return (
              <div key={item.id}
                className="bg-white rounded-2xl overflow-hidden group transition-all duration-250 hover:-translate-y-1"
                style={{
                  boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
                  border: selected.includes(item.product_id) ? '2px solid #E40046' : '1px solid #f0f0f0',
                }}>
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: 200 }}>
                  <Link to={`/product/${item.product_id}`}>
                    <img src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'} alt={prod.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </Link>
  
                  {/* Price change badge */}
                  {priceChange < 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-[10px] font-extrabold rounded-full bg-green-500">
                      ↓ ₹{Math.abs(priceChange).toLocaleString()} Drop!
                    </span>
                  )}
                  {stockStr !== 'In Stock' && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 text-white text-[10px] font-extrabold rounded-full bg-orange-500">
                      {stockStr}
                    </span>
                  )}
  
                  {/* Select checkbox */}
                  <button onClick={() => toggle(item.product_id)}
                    className="absolute bottom-3 left-3 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                    style={{ backgroundColor: selected.includes(item.product_id) ? '#E40046' : 'rgba(255,255,255,0.9)', border: '2px solid ' + (selected.includes(item.product_id) ? '#E40046' : '#ddd') }}>
                    {selected.includes(item.product_id) && <span className="text-white text-[11px] font-extrabold">✓</span>}
                  </button>
  
                  {/* Remove */}
                  <button onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                    <CloseIcon size={13} className="text-gray-500" />
                  </button>
                </div>
  
                {/* Info */}
                <div className="p-3">
                  <Link to={`/product/${item.product_id}`}>
                    <p className="text-[12px] font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2 hover:text-[#E40046] transition-colors">{prod.name}</p>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#22c55e' }}>★ 4.5</span>
                    <span className="text-[10px] text-gray-400">({(124).toLocaleString()})</span>
                    <span className="text-[10px] text-gray-400 ml-auto">Saved recently</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[15px] font-extrabold text-gray-900">₹{prod.price.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 line-through">₹{(prod as any).original_price?.toLocaleString()}</span>
                    <span className="text-[11px] font-bold text-green-600">{prod.discount}% off</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addToCart(item.product_id, 1, 'Default')} className="flex-1 py-2 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1 hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#E40046' }}>
                      <CartIcon size={12} /> Add to Cart
                    </button>
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-all"
                      style={{ border: '1px solid #eee' }}>
                      <BellIcon size={14} className="text-blue-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-24">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fff5f7' }}>
                <HeartIcon size={36} className="text-gray-200" />
              </div>
              <p className="text-[18px] font-bold text-gray-700 mb-2">This list is empty</p>
              <p className="text-[14px] text-gray-400 mb-6">Browse products and tap ♡ to save them here</p>
              <Link to="/search" className="px-6 py-3 rounded-2xl font-bold text-white text-[14px] inline-block"
                style={{ backgroundColor: '#E40046' }}>Browse Products</Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
