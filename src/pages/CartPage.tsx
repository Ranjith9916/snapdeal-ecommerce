import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CartIcon, CloseIcon, ShieldIcon, TruckIcon, RotateCcwIcon, SparklesIcon, TagIcon } from '../components/Icons'
import Footer from '../components/Footer'
import { useCart, CartItem } from '../contexts/CartContext'
import { validateCoupon } from '../services/coupons'
import { CARD_OFFERS, getBestCardOffer } from '../data/cardOffers'

const suggestedItems = [
  { id: 'b8571648-0196-49e9-897e-6eb804514821', name: 'Sony Earbuds WF-1000XM5', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop&auto=format', price: 14990 },
  { id: '7a4cf133-e9ff-4313-9271-8ce12b4c79ce', name: 'UGREEN USB-C Cable 2m', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&auto=format', price: 699 },
  { id: '0487ac77-87ba-4aa5-bed7-28af5a2fbf82', name: 'Anker 65W PD Charger', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&h=100&fit=crop&auto=format', price: 2499 },
]

export default function CartPage() {
  const { cart: dbCart, updateQuantity: updateQty, removeFromCart, addToCart } = useCart()
  
  // Local state to hide items optimistically before deleting from DB
  const [hiddenItems, setHiddenItems] = useState<string[]>([])
  const [undoItem, setUndoItem] = useState<CartItem | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponSavings, setCouponSavings] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [validating, setValidating] = useState(false)

  // Filter out items hidden for undo
  const cart = dbCart.filter(item => !hiddenItems.includes(item.id))

  const remove = (id: string) => {
    const removed = cart.find(i => i.id === id)
    if (!removed) return
    
    // Hide it immediately
    setHiddenItems(prev => [...prev, id])
    setUndoItem(removed)
    
    if (timerRef.current) clearTimeout(timerRef.current)
    
    // In 5s, if not undone, commit to db
    timerRef.current = setTimeout(() => {
      setUndoItem(null)
      setHiddenItems(prev => prev.filter(hid => hid !== id))
      removeFromCart(id)
    }, 5000)
  }
  
  const undoRemove = () => {
    if (undoItem) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setHiddenItems(prev => prev.filter(hid => hid !== undoItem.id))
      setUndoItem(null)
    }
  }
  
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const originalTotal = cart.reduce((s, i) => s + i.original * i.qty, 0)
  const discount = originalTotal - subtotal
  const delivery = subtotal > 499 ? 0 : 49
  const total = subtotal - couponSavings + delivery
  const bestCard = getBestCardOffer(subtotal)

  const applyCoupon = async () => {
    if (!coupon.trim()) {
      setCouponError('Please enter a coupon code.')
      return
    }
    setValidating(true)
    setCouponError('')

    const result = await validateCoupon(coupon, subtotal)
    setValidating(false)

    if (result.valid) {
      setAppliedCoupon(result.code || coupon.trim().toUpperCase())
      setCouponSavings(result.calculated_discount)
    } else {
      setCouponError(result.message || 'Invalid coupon code')
      setAppliedCoupon('')
      setCouponSavings(0)
    }
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-[24px] font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <CartIcon size={24} className="text-[#E40046]" />
          Shopping Cart <span className="text-gray-400 font-normal text-[18px]">({cart.length} items)</span>
        </h1>

        {/* Undo toast */}
        {undoItem && (
          <div className="mb-4 px-5 py-3 rounded-2xl flex items-center justify-between gap-4"
            style={{ backgroundColor: '#1f2937', color: '#fff' }}>
            <span className="text-[13px] font-medium">
              "{undoItem.name.slice(0, 40)}…" removed from cart
            </span>
            <button onClick={undoRemove}
              className="text-[13px] font-bold px-3 py-1 rounded-xl hover:bg-white/20 transition-all shrink-0"
              style={{ color: '#fbbf24' }}>
              Undo
            </button>
          </div>
        )}

        {/* Empty cart */}
        {cart.length === 0 && !undoItem && (
          <div className="text-center py-24">
            <p className="text-6xl mb-5">🛒</p>
            <h2 className="text-[22px] font-bold text-gray-800 mb-2">Your cart is waiting for something great</h2>
            <p className="text-[14px] text-gray-400 mb-6">Add products from the homepage or search for what you need</p>
            <Link to="/" className="px-6 py-3 rounded-xl text-[14px] font-bold text-white inline-block"
              style={{ backgroundColor: '#E40046' }}>Explore Products</Link>
          </div>
        )}

        <div className="flex gap-6 items-start flex-col lg:flex-row">
          {/* Cart Items */}
          <div className="flex-1 min-w-0 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-5 flex gap-4" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <Link to={`/product/${item.product_id}`}>
                  <img src={item.img} alt={item.name} className="w-[100px] h-[100px] object-cover rounded-xl shrink-0" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <Link to={`/product/${item.product_id}`}>
                      <p className="text-[14px] font-semibold text-gray-800 leading-snug hover:text-[#E40046] transition-colors">{item.name}</p>
                    </Link>
                    <button onClick={() => remove(item.id)} className="shrink-0 w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 flex items-center justify-center transition-all">
                      <CloseIcon size={14} className="text-gray-400" />
                    </button>
                  </div>
                  <p className="text-[12px] text-gray-400 mt-1 mb-2">Color: {item.color} · Seller: {item.seller}</p>

                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-[16px] font-extrabold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                    <span className="text-[12px] text-gray-400 line-through">₹{(item.original * item.qty).toLocaleString()}</span>
                    <span className="text-[12px] font-bold text-green-600">Save ₹{((item.original - item.price) * item.qty).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Qty */}
                    <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600 font-bold text-[16px]">−</button>
                      <span className="w-8 text-center text-[14px] font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600 font-bold text-[16px]">+</button>
                    </div>

                    <span className="text-[12px] text-green-600 font-semibold flex items-center gap-1">
                      <TruckIcon size={12} /> Delivery {item.delivery} • FREE
                    </span>
                    <span className="text-[12px] text-gray-400 flex items-center gap-1">
                      <RotateCcwIcon size={12} /> 7-day return
                    </span>
                    {item.hasEMI && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        EMI from ₹1,041/mo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Frequently Bought Together */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <p className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                <SparklesIcon size={15} className="text-[#E40046]" /> Frequently Bought Together
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {suggestedItems.map((s) => (
                  <div key={s.id} className="shrink-0 flex gap-3 items-center p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all" style={{ border: '1px solid #eee' }}>
                    <img src={s.img} alt={s.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="text-[11px] font-semibold text-gray-700 max-w-[120px] line-clamp-2">{s.name}</p>
                      <p className="text-[12px] font-bold text-[#E40046] mt-0.5">₹{s.price.toLocaleString()}</p>
                      <button onClick={() => addToCart(s.id, 1)} className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-lg text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: '#E40046' }}>+ Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[360px] shrink-0">
            {/* Coupon */}
            <div className="bg-white rounded-2xl p-5 mb-4" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <p className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                <TagIcon size={14} className="text-[#E40046]" /> Coupon / Promo Code
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div>
                    <p className="text-[12px] font-bold text-green-700">{appliedCoupon} applied!</p>
                    <p className="text-[11px] text-green-600">You save ₹{couponSavings.toLocaleString()}</p>
                  </div>
                  <button onClick={() => { setAppliedCoupon(''); setCouponSavings(0); setCoupon(''); setCouponError('') }} className="text-[11px] text-red-500 font-semibold">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter code (SNAP20 / SAVE500)" className="flex-1 px-3 py-2 text-[12px] rounded-xl outline-none uppercase"
                      style={{ border: couponError ? '1px solid #ef4444' : '1px solid #e5e7eb' }} />
                    <button onClick={applyCoupon} disabled={validating} className="px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#E40046', opacity: validating ? 0.7 : 1 }}>
                      {validating ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-500 font-medium mt-1.5">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Bank Card Offers Callout */}
            {subtotal > 0 && bestCard && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 border border-blue-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">💳</span>
                    <span className="text-[13px] font-extrabold text-blue-900">Partner Bank Card Offers</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                    Save up to ₹{bestCard.discount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[12px] text-gray-700 leading-snug">
                  Choose <span className="font-bold text-blue-900">{bestCard.offer.bank}</span> or other partner cards at checkout for an instant discount of <span className="font-bold text-green-700">₹{bestCard.discount.toLocaleString()}</span>!
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-blue-100/60">
                  {CARD_OFFERS.slice(0, 4).map(o => (
                    <span key={o.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-gray-700 border border-blue-100 shadow-2xs">
                      {o.bank} ({o.tag})
                    </span>
                  ))}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
                    +2 more
                  </span>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <p className="text-[16px] font-bold text-gray-900 mb-4">Order Summary</p>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[13px] text-green-600">
                  <span>Product Discount</span>
                  <span className="font-semibold">−₹{discount.toLocaleString()}</span>
                </div>
                {couponSavings > 0 && (
                  <div className="flex justify-between text-[13px] text-green-600">
                    <span>Coupon ({appliedCoupon})</span>
                    <span className="font-semibold">−₹{couponSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between text-[16px] font-extrabold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                {discount + couponSavings > 0 && (
                  <p className="text-[12px] text-green-600 font-bold text-center">
                    You're saving ₹{(discount + couponSavings).toLocaleString()} on this order 🎉
                  </p>
                )}
              </div>

              <Link to="/checkout">
                <button className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #E40046 0%, #c9003c 100%)', boxShadow: '0 4px 24px rgba(228,0,70,0.35)' }}>
                  Proceed to Checkout →
                </button>
              </Link>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[['🔒', 'Secure\nPayment'], ['🚚', 'Fast\nDelivery'], ['↩️', 'Easy\nReturns']].map(([icon, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-[18px]">{icon}</p>
                    <p className="text-[10px] text-gray-400 whitespace-pre-line leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-4 p-4 rounded-2xl flex gap-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <ShieldIcon size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-bold text-gray-700">100% Secure Checkout</p>
                <p className="text-[11px] text-gray-400">Your payment information is encrypted and protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
