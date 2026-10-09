import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldIcon, TruckIcon, CreditCardIcon } from '../components/Icons'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { getUserAddresses, addAddress, AddressModel } from '../services/addresses'
import { checkout } from '../services/orders'
import { validateCoupon } from '../services/coupons'

type Step = 'address' | 'delivery' | 'payment' | 'success'

const deliverySlots = [
  { id: 'd1', label: 'Standard Delivery', sub: 'In 2–4 business days', price: 0, badge: '' },
  { id: 'd2', label: 'Express Delivery', sub: 'Tomorrow by 6 PM', price: 99, badge: '🔥 Popular' },
  { id: 'd3', label: 'Same Day Delivery', sub: 'Today by 10 PM', price: 199, badge: '⚡ Fastest' },
]

const paymentMethods = [
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', icon: '⚡', desc: 'Instant payment via UPI app' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks supported' },
  { id: 'emi', label: 'EMI', icon: '📅', desc: 'No-cost EMI available on select cards' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
]

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, subtotal, discount, deliveryFee, clearCart } = useCart()

  const [step, setStep] = useState<Step>('address')
  const [addresses, setAddresses] = useState<AddressModel[]>([])
  const [selAddress, setSelAddress] = useState<string>('')
  const [selDelivery, setSelDelivery] = useState('d1')
  const [selPayment, setSelPayment] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [newAddr, setNewAddr] = useState(false)
  const [orderDisplayId, setOrderDisplayId] = useState('')

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState('')
  const [couponError, setCouponError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const [newAddrForm, setNewAddrForm] = useState({ name: '', phone: '', address1: '', address2: '', city: '', pin: '' })

  useEffect(() => {
    if (user) {
      getUserAddresses(user.id).then(data => {
        setAddresses(data)
        if (data.length > 0) {
          setSelAddress(data[0].id)
        } else {
          setNewAddr(true) // Prompt to add address if none exists
        }
      })
    }
  }, [user])

  const selectedSlot = deliverySlots.find((d) => d.id === selDelivery) || deliverySlots[0]
  const finalDeliveryPrice = deliveryFee + selectedSlot.price
  const grandTotal = Math.max(0, subtotal - couponDiscount + finalDeliveryPrice)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.')
      return
    }
    setValidatingCoupon(true)
    setCouponError('')
    setCouponMsg('')

    const result = await validateCoupon(couponCode, subtotal)
    setValidatingCoupon(false)

    if (result.valid) {
      setAppliedCoupon(result.code || couponCode.toUpperCase().trim())
      setCouponDiscount(result.calculated_discount)
      setCouponMsg(`Coupon ${result.code} applied! Saved ₹${result.calculated_discount.toLocaleString()}`)
    } else {
      setCouponError(result.message || 'Invalid coupon code.')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon('')
    setCouponDiscount(0)
    setCouponCode('')
    setCouponMsg('')
    setCouponError('')
  }

  const handleSaveAddress = async () => {
    if (!user) return
    if (!newAddrForm.name || !newAddrForm.phone || !newAddrForm.address1) {
      alert('Please fill in Name, Phone, and Address.')
      return
    }

    const fullAddress = `${newAddrForm.address1}, ${newAddrForm.address2 ? newAddrForm.address2 + ', ' : ''}${newAddrForm.city || 'Bengaluru'} - ${newAddrForm.pin || '560001'}`
    const { success, data } = await addAddress(user.id, {
      label: 'Home',
      full_name: newAddrForm.name,
      phone: newAddrForm.phone,
      address_text: fullAddress
    })
    if (success && data) {
      setAddresses([data, ...addresses])
      setSelAddress(data.id)
      setNewAddr(false)
    } else {
      // Create local address fallback
      const localAddr: AddressModel = {
        id: 'addr_' + Date.now(),
        user_id: user.id,
        label: 'Home',
        full_name: newAddrForm.name,
        phone: newAddrForm.phone,
        address_text: fullAddress
      }
      setAddresses([localAddr, ...addresses])
      setSelAddress(localAddr.id)
      setNewAddr(false)
    }
  }

  const placeOrder = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'))
      return
    }

    if (!selAddress) {
      alert('Please select or add a delivery address.')
      setStep('address')
      return
    }

    setProcessing(true)

    const addressObj = addresses.find(a => a.id === selAddress) || {
      full_name: user.user_metadata?.first_name || 'Customer',
      phone: '9876543210',
      address_text: 'MG Road, Bengaluru - 560001'
    }

    const totals = {
      subtotal,
      discount,
      delivery: finalDeliveryPrice,
      total: grandTotal
    }
    const addressSnapshot = {
      name: addressObj.full_name,
      phone: addressObj.phone,
      address: addressObj.address_text
    }

    const result = await checkout(
      user.id,
      selAddress,
      addressSnapshot,
      cart,
      totals,
      selPayment,
      selectedSlot.label,
      appliedCoupon || null
    )

    setProcessing(false)
    if (result.success && result.orderId) {
      await clearCart()
      setOrderDisplayId(result.orderId)
      setStep('success')
    } else {
      alert('Checkout could not be completed. Please try again.')
    }
  }

  // Guest or not signed in view
  if (!user && step !== 'success') {
    return (
      <>
        <div className="max-w-[700px] mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#E40046] flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-sm" style={{ border: '1px solid #fecdd3' }}>
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Sign in to Complete Checkout</h2>
          <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
            Please sign in or create an account to save your delivery address, track orders in real time, and securely complete your purchase.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
            className="px-8 py-3.5 rounded-2xl font-extrabold text-white text-[15px] shadow-lg hover:opacity-90 transition-all"
            style={{ backgroundColor: '#E40046', boxShadow: '0 4px 20px rgba(228,0,70,0.3)' }}
          >
            Sign In / Register
          </button>
          <div className="mt-6">
            <Link to="/cart" className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
              ← Return to Cart
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Empty cart view
  if (cart.length === 0 && step !== 'success') {
    return (
      <>
        <div className="max-w-[600px] mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 text-sm">Add some amazing items to your cart before proceeding to checkout.</p>
          <Link to="/search" className="px-8 py-3.5 rounded-2xl font-bold text-white text-sm inline-block hover:opacity-90 transition-all" style={{ backgroundColor: '#E40046' }}>
            Explore Products
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  if (step === 'success') {
    return (
      <>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center py-12">
          {/* Animated success circle */}
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-xl" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <span className="text-[52px] text-white">✓</span>
          </div>
          <h2 className="text-[32px] font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h2>
          <p className="text-[16px] text-gray-500 mb-2">Order ID: <span className="font-bold text-gray-800">{orderDisplayId}</span></p>
          <p className="text-[14px] text-gray-400 mb-8 max-w-md">
            Thank you for shopping with Snapdeal! Your items are confirmed and will be dispatched promptly. You can track this order in your Dashboard.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/dashboard">
              <button className="px-8 py-3.5 rounded-2xl font-bold text-white text-[15px] hover:opacity-90 transition-all" style={{ backgroundColor: '#E40046' }}>View My Orders</button>
            </Link>
            <Link to="/">
              <button className="px-8 py-3.5 rounded-2xl font-bold text-[15px] transition-all hover:bg-red-50" style={{ border: '2px solid #E40046', color: '#E40046' }}>Continue Shopping</button>
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg w-full">
            {[['📦', 'Order Confirmed', 'Just now'], ['🚚', 'Estimated Delivery', 'Tomorrow'], ['💬', 'Status Updates', 'Active']].map(([icon, label, val]) => (
              <div key={label} className="text-center p-4 rounded-2xl bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <p className="text-[24px] mb-1">{icon}</p>
                <p className="text-[11px] font-bold text-gray-700">{label}</p>
                <p className="text-[11px] text-gray-400">{val}</p>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const steps: Step[] = ['address', 'delivery', 'payment']
  const stepIdx = steps.indexOf(step)

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {['Address', 'Delivery', 'Payment'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-extrabold transition-all"
                  style={{ backgroundColor: i <= stepIdx ? '#E40046' : '#f0f0f0', color: i <= stepIdx ? '#fff' : '#999' }}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className="text-[11px] font-bold mt-1 text-gray-700">{s}</span>
              </div>
              {i < 2 && (
                <div className="flex-1 h-0.5 mx-3 mb-4 transition-all"
                  style={{ backgroundColor: i < stepIdx ? '#E40046' : '#e5e7eb' }} />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-8 items-start flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full">

            {/* STEP 1: Address */}
            {step === 'address' && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <p className="text-[18px] font-extrabold text-gray-900 mb-5">Select Delivery Address</p>
                <div className="space-y-3 mb-4">
                  {addresses.length === 0 && !newAddr && (
                    <p className="text-gray-500 text-sm">No saved addresses found. Please add a new delivery address.</p>
                  )}
                  {addresses.map((a) => (
                    <button key={a.id} onClick={() => setSelAddress(a.id)} className="w-full text-left p-4 rounded-2xl transition-all"
                      style={{ border: selAddress === a.id ? '2px solid #E40046' : '1px solid #e5e7eb', backgroundColor: selAddress === a.id ? '#fff5f7' : '#fff' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5"
                          style={{ borderColor: selAddress === a.id ? '#E40046' : '#ccc', backgroundColor: selAddress === a.id ? '#E40046' : 'transparent' }}>
                          {selAddress === a.id && <span className="w-2.5 h-2.5 rounded-full bg-white block" />}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white mr-2" style={{ backgroundColor: selAddress === a.id ? '#E40046' : '#9ca3af' }}>{a.label}</span>
                          <span className="text-[13px] font-bold text-gray-800">{a.full_name}</span>
                          <p className="text-[12px] text-gray-500 mt-1">{a.address_text}</p>
                          <p className="text-[12px] text-gray-400 mt-0.5">{a.phone}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={() => setNewAddr(!newAddr)} className="text-[13px] font-bold mb-4 flex items-center gap-1" style={{ color: '#E40046' }}>
                  {newAddr ? '− Hide Address Form' : '+ Add New Address'}
                </button>

                {newAddr && (
                  <div className="grid grid-cols-2 gap-3 mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <input value={newAddrForm.name} onChange={e => setNewAddrForm({...newAddrForm, name: e.target.value})} placeholder="Full Name *" className="px-3 py-2.5 rounded-xl text-[13px] outline-none col-span-1 bg-white" style={{ border: '1px solid #e5e7eb' }} />
                    <input value={newAddrForm.phone} onChange={e => setNewAddrForm({...newAddrForm, phone: e.target.value})} placeholder="Mobile Number *" className="px-3 py-2.5 rounded-xl text-[13px] outline-none col-span-1 bg-white" style={{ border: '1px solid #e5e7eb' }} />
                    <input value={newAddrForm.address1} onChange={e => setNewAddrForm({...newAddrForm, address1: e.target.value})} placeholder="Flat, House no., Building, Street *" className="px-3 py-2.5 rounded-xl text-[13px] outline-none col-span-2 bg-white" style={{ border: '1px solid #e5e7eb' }} />
                    <input value={newAddrForm.address2} onChange={e => setNewAddrForm({...newAddrForm, address2: e.target.value})} placeholder="Area, Landmark (Optional)" className="px-3 py-2.5 rounded-xl text-[13px] outline-none col-span-2 bg-white" style={{ border: '1px solid #e5e7eb' }} />
                    <input value={newAddrForm.city} onChange={e => setNewAddrForm({...newAddrForm, city: e.target.value})} placeholder="City (e.g. Bengaluru)" className="px-3 py-2.5 rounded-xl text-[13px] outline-none col-span-1 bg-white" style={{ border: '1px solid #e5e7eb' }} />
                    <input value={newAddrForm.pin} onChange={e => setNewAddrForm({...newAddrForm, pin: e.target.value})} placeholder="Pincode (e.g. 560001)" className="px-3 py-2.5 rounded-xl text-[13px] outline-none col-span-1 bg-white" style={{ border: '1px solid #e5e7eb' }} />

                    <div className="col-span-2 flex justify-end gap-2 mt-2">
                      <button onClick={handleSaveAddress} className="px-5 py-2.5 rounded-xl font-bold text-[13px] text-white hover:opacity-90 transition-all" style={{ backgroundColor: '#E40046' }}>Save Address</button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (selAddress) setStep('delivery')
                    else alert('Please select or save a delivery address first.')
                  }}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] text-white hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #E40046 0%, #c9003c 100%)', opacity: !selAddress ? 0.6 : 1 }}
                >
                  Continue to Delivery →
                </button>
              </div>
            )}

            {/* STEP 2: Delivery */}
            {step === 'delivery' && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <p className="text-[18px] font-extrabold text-gray-900 mb-5">Choose Delivery Option</p>
                <div className="space-y-3 mb-6">
                  {deliverySlots.map((d) => (
                    <button key={d.id} onClick={() => setSelDelivery(d.id)} className="w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4"
                      style={{ border: selDelivery === d.id ? '2px solid #E40046' : '1px solid #e5e7eb', backgroundColor: selDelivery === d.id ? '#fff5f7' : '#fff' }}>
                      <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: selDelivery === d.id ? '#E40046' : '#ccc', backgroundColor: selDelivery === d.id ? '#E40046' : 'transparent' }}>
                        {selDelivery === d.id && <span className="w-2.5 h-2.5 rounded-full bg-white block" />}
                      </div>
                      <TruckIcon size={20} className="text-[#E40046] shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold text-gray-800">{d.label}</p>
                          {d.badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fff5f7', color: '#E40046' }}>{d.badge}</span>}
                        </div>
                        <p className="text-[12px] text-gray-500">{d.sub}</p>
                      </div>
                      <span className="text-[14px] font-bold" style={{ color: d.price === 0 ? '#16a34a' : '#374151' }}>
                        {d.price === 0 ? 'FREE' : `₹${d.price}`}
                      </span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep('payment')} className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] text-white hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #E40046 0%, #c9003c 100%)' }}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 3: Payment */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <p className="text-[18px] font-extrabold text-gray-900 mb-5">Payment Method</p>
                <div className="space-y-2 mb-6">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id}>
                      <button onClick={() => setSelPayment(pm.id)} className="w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4"
                        style={{ border: selPayment === pm.id ? '2px solid #E40046' : '1px solid #e5e7eb', backgroundColor: selPayment === pm.id ? '#fff5f7' : '#fff' }}>
                        <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                          style={{ borderColor: selPayment === pm.id ? '#E40046' : '#ccc', backgroundColor: selPayment === pm.id ? '#E40046' : 'transparent' }}>
                          {selPayment === pm.id && <span className="w-2.5 h-2.5 rounded-full bg-white block" />}
                        </div>
                        <span className="text-[20px]">{pm.icon}</span>
                        <div>
                          <p className="text-[14px] font-bold text-gray-800">{pm.label}</p>
                          <p className="text-[12px] text-gray-500">{pm.desc}</p>
                        </div>
                      </button>

                      {selPayment === 'upi' && pm.id === 'upi' && (
                        <div className="mt-2 px-4 py-3 bg-gray-50 rounded-xl">
                          <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="Enter UPI ID (e.g. yourname@okaxis)"
                            className="w-full px-4 py-2.5 rounded-xl text-[13px] outline-none bg-white border border-gray-200" />
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                              <button key={app} onClick={() => setUpiId(app.toLowerCase() + '@upi')}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-bold hover:bg-red-50 transition-all bg-white"
                                style={{ border: '1px solid #e5e7eb', color: '#E40046' }}>{app}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {selPayment === 'card' && pm.id === 'card' && (
                        <div className="mt-2 px-4 py-3 bg-gray-50 rounded-xl grid grid-cols-2 gap-3">
                          <input placeholder="Card Number (XXXX XXXX XXXX XXXX)" className="col-span-2 px-4 py-2.5 rounded-xl text-[13px] outline-none bg-white border border-gray-200" />
                          <input placeholder="Name on Card" className="px-4 py-2.5 rounded-xl text-[13px] outline-none bg-white border border-gray-200" />
                          <div className="flex gap-2">
                            <input placeholder="MM/YY" className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none bg-white border border-gray-200" />
                            <input placeholder="CVV" className="w-20 px-3 py-2.5 rounded-xl text-[13px] outline-none bg-white border border-gray-200" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={placeOrder} disabled={processing}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] text-white flex items-center justify-center gap-2 transition-all hover:opacity-95"
                  style={{ background: processing ? '#9ca3af' : 'linear-gradient(135deg, #E40046 0%, #c9003c 100%)', boxShadow: processing ? 'none' : '0 4px 24px rgba(228,0,70,0.35)' }}>
                  {processing ? (
                    <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                  ) : (
                    <><CreditCardIcon size={18} /> Place Order — ₹{grandTotal.toLocaleString()}</>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-gray-400">
                  <ShieldIcon size={13} /> Secured by 256-bit SSL encryption
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-white rounded-2xl p-5 sticky top-[120px]" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <p className="text-[15px] font-bold text-gray-900 mb-4">Order Summary</p>
              
              {/* Coupon Box in Checkout */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  🎟️ Apply Coupon / Promo Code
                </p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-50 border border-green-200">
                    <div>
                      <p className="text-[12px] font-bold text-green-700">{appliedCoupon} Applied</p>
                      <p className="text-[11px] text-green-600">Saved ₹{couponDiscount.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase())
                          setCouponError('')
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="e.g. SNAP20, SAVE500"
                        className="flex-1 px-3 py-2 text-[12px] font-medium rounded-xl outline-none bg-gray-50 uppercase"
                        style={{ border: couponError ? '1px solid #ef4444' : '1px solid #e5e7eb' }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                        className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: '#E40046', opacity: validatingCoupon ? 0.7 : 1 }}
                      >
                        {validatingCoupon ? '…' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] font-medium text-red-500 mt-1.5">{couponError}</p>
                    )}
                    {couponMsg && (
                      <p className="text-[11px] font-semibold text-green-600 mt-1.5">{couponMsg}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4 text-[13px] text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} item{cart.length === 1 ? '' : 's'})</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Catalog Discount</span>
                    <span className="font-semibold">−₹{discount.toLocaleString()}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon ({appliedCoupon})</span>
                    <span className="font-semibold">−₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({selectedSlot.label})</span>
                  <span className="font-semibold text-green-600">{finalDeliveryPrice === 0 ? 'FREE' : `₹${finalDeliveryPrice}`}</span>
                </div>
              </div>
              <div className="h-px bg-gray-100 mb-3" />
              <div className="flex justify-between text-[16px] font-extrabold text-gray-900 mb-4">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
              {(discount > 0 || couponDiscount > 0) && (
                <p className="text-[12px] text-green-600 font-bold text-center bg-green-50 py-1.5 rounded-lg mb-3">
                  You're saving ₹{(discount + couponDiscount).toLocaleString()} on this order! 🎉
                </p>
              )}

              {/* Step Navigation */}
              {step !== 'address' && (
                <button onClick={() => setStep(step === 'payment' ? 'delivery' : 'address')}
                  className="mt-2 w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:bg-gray-50"
                  style={{ border: '1px solid #e5e7eb', color: '#666' }}>
                  ← Back to previous step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
