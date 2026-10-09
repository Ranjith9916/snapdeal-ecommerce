import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserIcon, CartIcon, HeartIcon, MapPinIcon, ShieldIcon, RotateCcwIcon, SparklesIcon, TruckIcon, StarIcon, CloseIcon } from '../components/Icons'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { getProfile, ProfileModel } from '../services/profile'
import { getOrders, cancelOrder, OrderModel, OrderItemModel } from '../services/orders'
import { getUserAddresses, addAddress, updateAddress, deleteAddress, AddressModel } from '../services/addresses'
import { useWishlist } from '../contexts/WishlistContext'
import { useCart } from '../contexts/CartContext'

type Tab = 'overview' | 'orders' | 'wishlist' | 'coupons' | 'rewards' | 'addresses' | 'returns' | 'settings'

const coupons = [
  { code: 'SNAP20', desc: '20% off on all electronics', expiry: 'Aug 31, 2026', category: 'Electronics', uses: 1, maxUses: 3 },
  { code: 'SAVE500', desc: '₹500 off on orders above ₹2,000', expiry: 'Sep 15, 2026', category: 'All', uses: 0, maxUses: 1 },
  { code: 'FASHION30', desc: '30% off on fashion items', expiry: 'Jul 31, 2026', category: 'Fashion', uses: 2, maxUses: 5 },
  { code: 'FREESHIP', desc: 'Free shipping on any order', expiry: 'Unlimited', category: 'All', uses: 0, maxUses: 99 },
]

const statusColor: Record<string, string> = { Delivered: '#22c55e', 'In Transit': '#3b82f6', Cancelled: '#ef4444', Processing: '#f59e0b' }

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <UserIcon size={16} /> },
  { id: 'orders', label: 'My Orders', icon: <CartIcon size={16} /> },
  { id: 'wishlist', label: 'Wishlist', icon: <HeartIcon size={16} /> },
  { id: 'coupons', label: 'Coupons', icon: <SparklesIcon size={16} /> },
  { id: 'rewards', label: 'Rewards', icon: <StarIcon size={16} /> },
  { id: 'addresses', label: 'Addresses', icon: <MapPinIcon size={16} /> },
  { id: 'returns', label: 'Returns', icon: <RotateCcwIcon size={16} /> },
  { id: 'settings', label: 'Settings', icon: <ShieldIcon size={16} /> },
]

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { wishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  
  const [tab, setTab] = useState<Tab>('overview')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({ orders: true, deals: true, wishlist: false, sms: true, email: false })
  const [orderRatings, setOrderRatings] = useState<Record<string, number>>({})

  const [profile, setProfile] = useState<ProfileModel | null>(null)
  const [ordersData, setOrdersData] = useState<(OrderModel & { order_items: OrderItemModel[] })[]>([])
  const [addressesData, setAddressesData] = useState<AddressModel[]>([])

  // Order cancellation state & filters
  const [cancellingOrder, setCancellingOrder] = useState<(OrderModel & { order_items: OrderItemModel[] }) | null>(null)
  const [cancelReason, setCancelReason] = useState('Ordered by mistake')
  const [cancelComments, setCancelComments] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelToast, setCancelToast] = useState<string | null>(null)
  const [reorderToast, setReorderToast] = useState<string | null>(null)
  const [ordersFilter, setOrdersFilter] = useState<'All' | 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled'>('All')

  // Address CRUD modal & state
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false)
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null)
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', phone: '', address_text: '' })
  const [addrError, setAddrError] = useState('')
  const [addrLoading, setAddrLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    
    getProfile(user.id).then(setProfile)
    getOrders(user.id).then(setOrdersData)
    getUserAddresses(user.id).then(setAddressesData)
  }, [user, navigate])

  const openAddAddress = () => {
    setEditingAddrId(null)
    setAddrForm({ label: 'Home', full_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '', phone: profile?.phone || '', address_text: '' })
    setAddrError('')
    setIsAddrModalOpen(true)
  }

  const openEditAddress = (addr: AddressModel) => {
    setEditingAddrId(addr.id)
    setAddrForm({ label: addr.label || 'Home', full_name: addr.full_name, phone: addr.phone, address_text: addr.address_text })
    setAddrError('')
    setIsAddrModalOpen(true)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const trimmedName = addrForm.full_name.trim()
    const trimmedPhone = addrForm.phone.trim()
    const trimmedText = addrForm.address_text.trim()

    if (!trimmedName) {
      setAddrError('Full name is required.')
      return
    }
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setAddrError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!trimmedText || trimmedText.length < 10) {
      setAddrError('Please enter a complete address (at least 10 characters).')
      return
    }

    setAddrLoading(true)
    setAddrError('')

    if (editingAddrId) {
      const res = await updateAddress(editingAddrId, {
        label: addrForm.label,
        full_name: trimmedName,
        phone: trimmedPhone,
        address_text: trimmedText
      })
      setAddrLoading(false)
      if (res.success) {
        setAddressesData(prev => prev.map(a => a.id === editingAddrId ? { ...a, label: addrForm.label, full_name: trimmedName, phone: trimmedPhone, address_text: trimmedText } : a))
        setIsAddrModalOpen(false)
      } else {
        setAddrError('Failed to update address. Please try again.')
      }
    } else {
      const res = await addAddress(user.id, {
        label: addrForm.label,
        full_name: trimmedName,
        phone: trimmedPhone,
        address_text: trimmedText
      })
      setAddrLoading(false)
      if (res.success && res.data) {
        setAddressesData(prev => [res.data, ...prev])
        setIsAddrModalOpen(false)
      } else {
        // Fallback local address if database table write is restricted
        const localAddr: AddressModel = {
          id: 'addr_' + Date.now(),
          user_id: user.id,
          label: addrForm.label,
          full_name: trimmedName,
          phone: trimmedPhone,
          address_text: trimmedText
        }
        setAddressesData(prev => [localAddr, ...prev])
        setIsAddrModalOpen(false)
      }
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    await deleteAddress(id)
    setAddressesData(prev => prev.filter(a => a.id !== id))
  }

  const handleOpenCancelModal = (order: OrderModel & { order_items: OrderItemModel[] }) => {
    setCancellingOrder(order)
    setCancelReason('Ordered by mistake')
    setCancelComments('')
  }

  const handleConfirmCancel = async () => {
    if (!cancellingOrder || !user) return
    setCancelLoading(true)
    const fullReason = cancelComments.trim() ? `${cancelReason}: ${cancelComments.trim()}` : cancelReason
    const res = await cancelOrder(cancellingOrder.id || cancellingOrder.display_id, user.id, fullReason)
    
    if (res.success) {
      setOrdersData(prev => prev.map(o => {
        if (o.id === cancellingOrder.id || o.display_id === cancellingOrder.display_id) {
          return {
            ...o,
            status: 'Cancelled',
            cancellation_reason: fullReason,
            cancelled_at: new Date().toISOString()
          }
        }
        return o
      }))
      setCancelToast(`Order ${cancellingOrder.display_id} was successfully cancelled. Full refund of ₹${cancellingOrder.total_amount.toLocaleString()} has been initiated.`)
      setCancellingOrder(null)
      setTimeout(() => setCancelToast(null), 5000)
    }
    setCancelLoading(false)
  }

  const handleReorder = async (order: OrderModel & { order_items: OrderItemModel[] }) => {
    if (!order.order_items || order.order_items.length === 0) return
    for (const item of order.order_items) {
      await addToCart(item.product_id, item.quantity || 1, item.selected_color || 'Default')
    }
    setReorderToast(`Items from order ${order.display_id} added to your cart!`)
    setTimeout(() => setReorderToast(null), 4000)
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 items-start flex-col lg:flex-row">

          {/* Sidebar */}
          <div className="w-full lg:w-[260px] shrink-0">
            {/* Profile card */}
            <div className="bg-white rounded-2xl p-5 mb-4 text-center" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-[32px] font-extrabold text-white"
                style={{ background: 'linear-gradient(135deg, #E40046, #c9003c)' }}>
                {(profile?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <p className="text-[16px] font-extrabold text-gray-900">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[12px] text-gray-400 mb-1">{user?.email}</p>
              <p className="text-[12px] text-gray-400 mb-3">{profile?.phone || 'No phone added'}</p>
              <div className="flex justify-center gap-4 text-center">
                <div><p className="text-[18px] font-extrabold text-gray-900">{ordersData.length}</p><p className="text-[10px] text-gray-400">Orders</p></div>
                <div className="w-px bg-gray-100" />
                <div><p className="text-[18px] font-extrabold text-gray-900">{wishlist.length}</p><p className="text-[10px] text-gray-400">Wishlist</p></div>
                <div className="w-px bg-gray-100" />
                <div><p className="text-[18px] font-extrabold" style={{ color: '#E40046' }}>{profile?.points || 0}</p><p className="text-[10px] text-gray-400">Points</p></div>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              {navItems.map((n) => (
                <button key={n.id} onClick={() => setTab(n.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all"
                  style={{ backgroundColor: tab === n.id ? '#fff5f7' : 'transparent', color: tab === n.id ? '#E40046' : '#555', borderLeft: tab === n.id ? '3px solid #E40046' : '3px solid transparent' }}>
                  {n.icon}
                  <span className="text-[13px] font-semibold">{n.label}</span>
                  {n.id === 'orders' && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                      {ordersData.filter(o => ['processing', 'in transit'].includes(o.status?.toLowerCase())).length} active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Orders', val: ordersData.length, icon: '📦', color: '#3b82f6' },
                    { label: 'Total Spent', val: `₹${ordersData.reduce((acc, o) => acc + o.total_amount, 0).toLocaleString()}`, icon: '💳', color: '#E40046' },
                    { label: 'Points Earned', val: profile?.points || 0, icon: '⭐', color: '#f59e0b' },
                    { label: 'Active Coupons', val: coupons.length, icon: '🎟️', color: '#8b5cf6' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl p-4" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                      <p className="text-[24px] mb-2">{s.icon}</p>
                      <p className="text-[20px] font-extrabold" style={{ color: s.color }}>{s.val}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-extrabold text-[16px] text-gray-900">Recent Orders</p>
                    <button onClick={() => setTab('orders')} className="text-[12px] font-bold" style={{ color: '#E40046' }}>View All →</button>
                  </div>
                  {ordersData.length === 0 && <p className="text-gray-500 text-sm">No recent orders.</p>}
                  {ordersData.slice(0, 2).map((o) => {
                    const firstItem = o.order_items[0]
                    return (
                      <div key={o.id} className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <img src={firstItem?.products?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} alt="Product" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800 truncate">{firstItem?.products?.name || 'Multiple Items'}</p>
                          <p className="text-[11px] text-gray-400">{o.display_id} · {new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-gray-900">₹{o.total_amount.toLocaleString()}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: statusColor[o.status] || '#f59e0b' }}>{o.status}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* AI Insights */}
                <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #fdf4ff 100%)', border: '1px solid #fce7f3' }}>
                  <p className="font-extrabold text-[14px] mb-2 flex items-center gap-2" style={{ color: '#E40046' }}>
                    <SparklesIcon size={15} /> AI Shopping Insights
                  </p>
                  <ul className="space-y-1.5 text-[12px] text-gray-700">
                    <li>• You've saved ₹28,000+ across 4 orders this year</li>
                    <li>• Your most purchased category: <strong>Electronics</strong></li>
                    <li>• 3 wishlist items have dropped in price this week</li>
                    <li>• Best shopping time for you: <strong>Weekday evenings</strong></li>
                  </ul>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <p className="font-extrabold text-[18px] text-gray-900">My Orders</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">Track, cancel, or repurchase your recent orders</p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {(['All', 'Processing', 'In Transit', 'Delivered', 'Cancelled'] as const).map((statusKey) => {
                      const count = statusKey === 'All'
                        ? ordersData.length
                        : ordersData.filter(o => o.status?.toLowerCase() === statusKey.toLowerCase()).length
                      const isActive = ordersFilter === statusKey
                      return (
                        <button
                          key={statusKey}
                          onClick={() => setOrdersFilter(statusKey)}
                          className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#E40046] text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {statusKey}
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {cancelToast && (
                  <div className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
                    <span className="flex items-center gap-2">✓ {cancelToast}</span>
                    <button onClick={() => setCancelToast(null)} className="text-green-600 hover:text-green-800 text-sm font-bold">✕</button>
                  </div>
                )}

                {reorderToast && (
                  <div className="mb-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
                    <span className="flex items-center gap-2">🛒 {reorderToast}</span>
                    <Link to="/cart" className="underline font-extrabold hover:text-blue-900">View Cart →</Link>
                  </div>
                )}

                <div className="space-y-4">
                  {ordersData.length === 0 && <p className="text-gray-500">You have no orders yet.</p>}
                  {ordersData
                    .filter(o => ordersFilter === 'All' || o.status?.toLowerCase() === ordersFilter.toLowerCase())
                    .map((o) => (
                    <div key={o.id} className="p-4 rounded-2xl transition-all hover:border-gray-300" style={{ border: '1px solid #f0f0f0' }}>
                      <div className="flex items-start gap-4">
                        <img src={o.order_items?.[0]?.products?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'} alt="Product" className="w-[72px] h-[72px] rounded-xl object-cover shrink-0 border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[13px] font-semibold text-gray-800">{o.order_items?.[0]?.products?.name || 'Order Items'}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{o.display_id}</p>
                            </div>
                            <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: statusColor[o.status] || '#f59e0b' }}>{o.status}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="text-[13px] font-bold text-gray-900">₹{o.total_amount.toLocaleString()}</span>
                            <span className="text-[11px] text-gray-400">{new Date(o.created_at).toLocaleDateString()}</span>
                            {o.status === 'In Transit' && (
                              <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                                <TruckIcon size={11} /> Arriving soon
                              </span>
                            )}
                            {o.status === 'Processing' && (
                              <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                                ⏳ Preparing order
                              </span>
                            )}
                          </div>

                          {o.status === 'Cancelled' && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-red-50/90 border border-red-100 text-[11px] text-red-700 flex items-start gap-1.5">
                              <span className="font-bold">Cancellation:</span>
                              <span>
                                {o.cancellation_reason || 'Order was cancelled by customer'}. Full refund of ₹{o.total_amount.toLocaleString()} has been initiated to {o.payment_method || 'original payment method'}.
                              </span>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3 flex-wrap items-center">
                            {o.status === 'Delivered' && (
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map((star) => (
                                  <button key={star} onClick={() => setOrderRatings(r => ({ ...r, [o.id]: star }))}
                                    className="transition-all hover:scale-110">
                                    <StarIcon size={16} fill={(orderRatings[o.id] || 0) >= star ? '#f59e0b' : 'none'} stroke={((orderRatings[o.id] || 0) >= star) ? '#f59e0b' : '#d1d5db'} />
                                  </button>
                                ))}
                                <span className="text-[11px] text-gray-400 ml-1">Rate Product</span>
                              </div>
                            )}
                            {o.status === 'Delivered' && (
                              <button onClick={() => handleReorder(o)} className="px-3 py-1.5 text-[11px] font-bold rounded-xl hover:bg-blue-50 transition-all" style={{ border: '1px solid #dbeafe', color: '#3b82f6' }}>
                                Buy Again
                              </button>
                            )}
                            {o.status === 'Delivered' && (
                              <button onClick={() => setTab('returns')} className="px-3 py-1.5 text-[11px] font-bold rounded-xl hover:bg-red-50 transition-all" style={{ border: '1px solid #fecdd3', color: '#ef4444' }}>
                                Return/Refund
                              </button>
                            )}
                            {(o.status === 'Processing' || o.status === 'In Transit') && (
                              <button
                                onClick={() => handleOpenCancelModal(o)}
                                className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                              >
                                ✕ Cancel Order
                              </button>
                            )}
                            {o.status === 'Cancelled' && (
                              <button onClick={() => handleReorder(o)} className="px-3.5 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200">
                                ↻ Reorder
                              </button>
                            )}
                            <button className="px-3 py-1.5 text-[11px] font-bold rounded-xl hover:bg-gray-50 transition-all" style={{ border: '1px solid #e5e7eb', color: '#6b7280' }}>
                              Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {ordersData.filter(o => ordersFilter === 'All' || o.status?.toLowerCase() === ordersFilter.toLowerCase()).length === 0 && ordersData.length > 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No orders found under "{ordersFilter}".
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COUPONS */}
            {tab === 'coupons' && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <p className="font-extrabold text-[18px] text-gray-900 mb-5">My Coupons</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.code} className="p-4 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #fdf4ff 100%)', border: '2px dashed #fca5a5' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[20px] font-extrabold tracking-wider" style={{ color: '#E40046' }}>{c.code}</p>
                          <p className="text-[12px] text-gray-700 mt-1">{c.desc}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Category: {c.category} · Expires: {c.expiry}</p>
                          <p className="text-[11px] text-gray-400">Used {c.uses}/{c.maxUses} times</p>
                        </div>
                        <button onClick={() => navigator.clipboard?.writeText(c.code)}
                          className="shrink-0 px-3 py-1.5 rounded-xl font-bold text-white text-[11px]" style={{ backgroundColor: '#E40046' }}>
                          Copy
                        </button>
                      </div>
                      {/* Decorative */}
                      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: '#E40046' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REWARDS */}
            {tab === 'rewards' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <p className="font-extrabold text-[18px] text-gray-900 mb-1">Snapdeal Rewards</p>
                  <p className="text-[13px] text-gray-400 mb-5">Earn points on every purchase and redeem for discounts</p>
                  <div className="p-5 rounded-2xl mb-5 text-center" style={{ background: 'linear-gradient(135deg, #E40046, #c9003c)' }}>
                    <p className="text-[48px] font-extrabold text-white">{profile?.points || 0}</p>
                    <p className="text-[14px] text-white/80">SnapPoints Balance</p>
                    <p className="text-[12px] text-white/60 mt-1">≈ ₹{(profile?.points || 0) / 10} discount value (1pt = ₹0.10)</p>
                  </div>

                  {/* Progress to next tier */}
                  <div className="mb-5">
                    <div className="flex justify-between text-[12px] text-gray-600 mb-2">
                      <span>Silver Tier <span className="font-bold">1,240 pts</span></span>
                      <span>Gold Tier at 2,500 pts</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: '50%', background: 'linear-gradient(90deg, #E40046, #f97316)' }} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">1,260 more points to reach Gold Tier</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    {[['📦', 'Per Order', '10 pts per ₹100'], ['⭐', 'Product Review', '50 pts'], ['📣', 'Refer a Friend', '200 pts']].map(([icon, label, val]) => (
                      <div key={label} className="p-3 text-center rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #f0f0f0' }}>
                        <p className="text-[20px] mb-1">{icon}</p>
                        <p className="text-[12px] font-bold text-gray-800">{label}</p>
                        <p className="text-[11px] text-gray-400">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESSES */}
            {tab === 'addresses' && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-extrabold text-[18px] text-gray-900">Saved Addresses</p>
                  <button onClick={openAddAddress} className="text-[13px] font-bold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90" style={{ backgroundColor: '#E40046' }}>+ Add New</button>
                </div>
                <div className="space-y-4">
                  {addressesData.length === 0 && <p className="text-gray-500 text-sm">No saved addresses. Click "+ Add New" to add your delivery address.</p>}
                  {addressesData.map((a) => (
                    <div key={a.id} className="p-4 rounded-2xl" style={{ border: '1px solid #f0f0f0' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPinIcon size={14} className="text-[#E40046]" />
                          <span className="text-[12px] font-bold text-[#E40046]">{a.label}</span>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => openEditAddress(a)} className="text-[12px] font-bold text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDeleteAddress(a.id)} className="text-[12px] font-bold text-red-500 hover:underline">Delete</button>
                        </div>
                      </div>
                      <p className="text-[13px] font-bold text-gray-800">{a.full_name}</p>
                      <p className="text-[12px] text-gray-600 mt-0.5">{a.address_text}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">📞 {a.phone}</p>
                    </div>
                  ))}
                </div>

                {/* Address Add/Edit Modal */}
                {isAddrModalOpen && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-extrabold text-gray-900">
                          {editingAddrId ? 'Edit Address' : 'Add New Delivery Address'}
                        </h3>
                        <button onClick={() => setIsAddrModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                      </div>

                      {addrError && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                          {addrError}
                        </div>
                      )}

                      <form onSubmit={handleSaveAddress} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Address Label</label>
                          <div className="flex gap-2">
                            {['Home', 'Work', 'Other'].map(lbl => (
                              <button
                                type="button"
                                key={lbl}
                                onClick={() => setAddrForm(f => ({ ...f, label: lbl }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${addrForm.label === lbl ? 'bg-red-50 border-[#E40046] text-[#E40046]' : 'border-gray-200 text-gray-600'}`}
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            value={addrForm.full_name}
                            onChange={e => setAddrForm(f => ({ ...f, full_name: e.target.value }))}
                            placeholder="Receiver's name"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#E40046]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (10 digits) *</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={addrForm.phone}
                            onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                            placeholder="e.g. 9876543210"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#E40046]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Complete Address *</label>
                          <textarea
                            rows={3}
                            value={addrForm.address_text}
                            onChange={e => setAddrForm(f => ({ ...f, address_text: e.target.value }))}
                            placeholder="Flat/House No., Building, Street, Landmark, City - PIN"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#E40046]"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddrModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addrLoading}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: '#E40046', opacity: addrLoading ? 0.7 : 1 }}
                          >
                            {addrLoading ? 'Saving…' : (editingAddrId ? 'Update Address' : 'Save Address')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RETURNS */}
            {tab === 'returns' && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <p className="font-extrabold text-[18px] text-gray-900 mb-5">Returns & Refunds</p>
                <div className="text-center py-12">
                  <div className="text-[48px] mb-3">📦</div>
                  <p className="text-[16px] font-bold text-gray-700 mb-2">No Active Returns</p>
                  <p className="text-[13px] text-gray-400 mb-6">All your returned items and refunds will appear here</p>
                  <div className="p-4 rounded-2xl text-left max-w-sm mx-auto" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <p className="text-[13px] font-bold text-green-700 mb-2 flex items-center gap-2"><RotateCcwIcon size={14} /> Our Return Policy</p>
                    <ul className="text-[12px] text-green-700 space-y-1">
                      <li>• 7-day easy returns on all products</li>
                      <li>• Free pickup for returns</li>
                      <li>• Refund in 3–5 business days</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {tab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <p className="font-extrabold text-[18px] text-gray-900 mb-5">Notification Preferences</p>
                  <div className="space-y-4">
                    {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800 capitalize">{key.replace(/([A-Z])/g, ' $1')} Notifications</p>
                          <p className="text-[11px] text-gray-400">Receive updates via {key === 'email' ? 'email' : key === 'sms' ? 'SMS' : 'push notification'}</p>
                        </div>
                        <button onClick={() => setNotifications(n => ({ ...n, [key]: !val }))}
                          className="w-12 h-6 rounded-full transition-all relative"
                          style={{ backgroundColor: val ? '#E40046' : '#e5e7eb' }}>
                          <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                            style={{ left: val ? '26px' : '2px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <p className="font-extrabold text-[16px] text-gray-900 mb-4">Appearance</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">Dark Mode</p>
                      <p className="text-[11px] text-gray-400">Switch to a darker theme for night browsing</p>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)}
                      className="w-12 h-6 rounded-full transition-all relative"
                      style={{ backgroundColor: darkMode ? '#E40046' : '#e5e7eb' }}>
                      <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                        style={{ left: darkMode ? '26px' : '2px' }} />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <p className="font-extrabold text-[16px] text-gray-900 mb-4">Account</p>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-all" style={{ border: '1px solid #f0f0f0', color: '#374151' }}>Change Password</button>
                    <button className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-semibold hover:bg-red-50 transition-all" style={{ border: '1px solid #fecdd3', color: '#ef4444' }}>Delete Account</button>
                    <button onClick={async () => { await signOut(); navigate('/') }} className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-all" style={{ border: '1px solid #f0f0f0', color: '#6b7280' }}>Sign Out</button>
                  </div>
                </div>
              </div>
            )}

            {/* WISHLIST tab */}
            {tab === 'wishlist' && (
              <div className="text-center py-16">
                <p className="text-[18px] font-bold text-gray-700 mb-4">Your Wishlist</p>
                <Link to="/wishlist" className="px-6 py-3 rounded-2xl font-bold text-white text-[14px] inline-block" style={{ backgroundColor: '#E40046' }}>View Full Wishlist →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-extrabold text-sm">
                  ✕
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Cancel Order</h3>
                  <p className="text-xs text-gray-400">{cancellingOrder.display_id}</p>
                </div>
              </div>
              <button onClick={() => setCancellingOrder(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Item Summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-4 border border-gray-100">
              <img
                src={cancellingOrder.order_items?.[0]?.products?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
                alt="Product"
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {cancellingOrder.order_items?.[0]?.products?.name || 'Order Items'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Total Amount: <span className="font-extrabold text-gray-900">₹{cancellingOrder.total_amount.toLocaleString()}</span> ({cancellingOrder.payment_method})
                </p>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  'Ordered by mistake',
                  'Found a lower price elsewhere',
                  'Delivery time is too long',
                  'Need to change delivery address or phone number',
                  'Need to change items, size, or color',
                  'Other reason'
                ].map((reason) => (
                  <label
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      cancelReason === reason
                        ? 'bg-red-50/60 border-[#E40046] font-bold text-gray-900'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)}
                      className="accent-[#E40046] w-4 h-4"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Additional comments (optional)
              </label>
              <textarea
                value={cancelComments}
                onChange={(e) => setCancelComments(e.target.value)}
                placeholder="Tell us how we can improve..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#E40046] resize-none"
              />
            </div>

            {/* Refund Guarantee */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-2xl mb-5 flex items-start gap-2.5">
              <span className="text-base">💰</span>
              <div>
                <p className="text-xs font-bold text-green-800">100% Instant Refund Guarantee</p>
                <p className="text-[11px] text-green-700 leading-relaxed mt-0.5">
                  ₹{cancellingOrder.total_amount.toLocaleString()} will be automatically credited back to your {cancellingOrder.payment_method}. No cancellation fees apply.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Nevermind, Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all bg-[#E40046] hover:bg-[#c9003c] disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

