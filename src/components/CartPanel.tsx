import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CloseIcon, SparklesIcon, ShieldIcon, TruckIcon } from './Icons'
import { useCart } from '../contexts/CartContext'

interface CartPanelProps {
  open: boolean
  onClose: () => void
}

export default function CartPanel({ open, onClose }: CartPanelProps) {
  const { cart: items, updateQuantity: updateQty, removeFromCart: removeItem } = useCart()
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const navigate = useNavigate()

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const saved = items.reduce((s, i) => s + (i.original - i.price) * i.qty, 0)
  const couponDiscount = couponApplied ? 180 : 0
  const delivery = subtotal > 499 ? 0 : 49
  const total = subtotal - couponDiscount + delivery

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ top: 112 }} onClick={onClose} />
      <div
        className="fixed z-50 bg-white flex flex-col"
        style={{
          top: 112,
          right: 24,
          width: 460,
          maxHeight: 640,
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.14)',
          border: '1px solid #f0f0f0',
          animation: 'panelIn 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #f5f5f5' }}>
          <div>
            <p className="font-bold text-gray-900 text-[16px]">Shopping Cart</p>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">{items.length} items · You save ₹{saved.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><CloseIcon size={18} /></button>
        </div>

        {/* Savings badge */}
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2.5" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span className="text-green-600 font-bold text-[13px]">🎉 You're saving ₹{saved.toLocaleString()} on this order!</span>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 rounded-2xl" style={{ border: '1px solid #f0f0f0' }}>
              <Link to={`/product/${item.product_id}`} onClick={onClose}>
                <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-xl shrink-0 hover:opacity-90 transition-opacity" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} onClick={onClose}>
                  <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-[#E40046] transition-colors">{item.name}</p>
                </Link>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Seller: {item.seller}</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-[15px] font-extrabold text-gray-900">₹{item.price.toLocaleString()}</span>
                  <span className="text-[11px] text-gray-400 line-through">₹{item.original.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <TruckIcon size={11} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 font-medium">{item.delivery}</span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">7-day return</span>
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  {/* Qty */}
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #eee' }}>
                    <button onClick={() => updateQty(item.id, -1)} className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-[14px] font-bold transition-all">−</button>
                    <span className="px-3 text-[13px] font-bold text-gray-800 border-x border-gray-100">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-[14px] font-bold transition-all">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                </div>
              </div>
            </div>
          ))}

          {/* AI recommendations */}
          <div className="px-3 py-3 rounded-2xl" style={{ backgroundColor: '#fff9fa', border: '1px solid #fce7f3' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <SparklesIcon size={12} className="text-[#E40046]" />
              <span className="text-[11px] font-bold text-[#E40046] uppercase tracking-wide">Frequently Bought Together</span>
            </div>
            <div className="flex gap-2">
              {[
                { name: 'boAt Carry Case', price: '₹299', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop&auto=format' },
                { name: 'Screen Protector', price: '₹149', img: 'https://images.unsplash.com/photo-1512446816042-444d641267d4?w=80&h=80&fit=crop&auto=format' },
              ].map((r) => (
                <button
                  key={r.name}
                  onClick={() => { navigate(`/search?q=${encodeURIComponent(r.name)}`); onClose(); }}
                  className="flex items-center gap-2 flex-1 px-2.5 py-2 rounded-xl hover:bg-white transition-all text-left"
                  style={{ border: '1px solid #f0e0e8' }}
                >
                  <img src={r.img} className="w-10 h-10 rounded-lg object-cover shrink-0" alt={r.name} />
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-gray-700 line-clamp-1">{r.name}</p>
                    <p className="text-[12px] font-bold" style={{ color: '#E40046' }}>{r.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="px-4 pb-4 pt-3 shrink-0" style={{ borderTop: '1px solid #f5f5f5' }}>
          {/* Coupon */}
          <div className="flex gap-2 mb-3">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 rounded-xl text-[13px] font-medium outline-none"
              style={{ border: '1px solid #e5e5e5' }}
            />
            <button
              onClick={() => { if (coupon) setCouponApplied(true) }}
              className="px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#E40046' }}
            >
              Apply
            </button>
          </div>
          {couponApplied && (
            <p className="text-[12px] font-semibold text-green-600 mb-2">✓ Coupon applied · Saved ₹180!</p>
          )}

          {/* Summary rows */}
          <div className="space-y-1.5 mb-3 text-[13px]">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Discount</span><span>−₹{saved.toLocaleString()}</span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Coupon ({coupon})</span><span>−₹180</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Delivery</span>
              <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>
          </div>

          <div className="flex justify-between font-extrabold text-[16px] text-gray-900 pt-2.5 mb-3" style={{ borderTop: '2px solid #f0f0f0' }}>
            <span>Total</span><span>₹{total.toLocaleString()}</span>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-4 mb-3">
            {[
              { icon: ShieldIcon, label: 'Secure Payment' },
              { icon: TruckIcon, label: 'Free Delivery' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-gray-400">
                <Icon size={12} />
                <span className="text-[11px] font-medium">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { navigate('/checkout'); onClose(); }}
            className="w-full py-3.5 rounded-2xl text-[15px] font-extrabold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #E40046 0%, #b0003a 100%)', boxShadow: '0 8px 24px rgba(228,0,70,0.3)' }}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
      <style>{`@keyframes panelIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </>
  )
}
