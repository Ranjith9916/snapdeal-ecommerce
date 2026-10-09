import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HeartIcon, UserIcon, SparklesIcon, ZapIcon } from './Icons'

interface LeftSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const chevronRight = (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const menuIcon = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

type Category = {
  id: string
  label: string
  to: string
  icon: string
  subs: { label: string; to: string }[]
  badge?: string
}

const categories: Category[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    to: '/search?cat=electronics',
    icon: '💻',
    subs: [
      { label: 'Laptops & Computers', to: '/search?cat=laptops' },
      { label: 'Cameras & Photography', to: '/search?cat=cameras' },
      { label: 'Speakers & Audio', to: '/search?cat=audio' },
      { label: 'Smart Watches', to: '/search?cat=watches' },
      { label: 'Gaming', to: '/search?cat=gaming' },
      { label: 'Accessories', to: '/search?cat=accessories' },
    ],
  },
  {
    id: 'fashion',
    label: 'Fashion',
    to: '/search?cat=fashion',
    icon: '👗',
    subs: [
      { label: 'Traditional Wear', to: '/search?cat=traditional' },
      { label: "Men's Clothing", to: '/search?cat=mens' },
      { label: "Women's Clothing", to: '/search?cat=womens' },
      { label: "Kids' Fashion", to: '/search?cat=kids-fashion' },
      { label: 'Footwear', to: '/search?cat=footwear' },
      { label: 'Watches', to: '/search?cat=watches' },
      { label: 'Bags & Handbags', to: '/search?cat=fashion&q=Bags' },
      { label: 'Accessories', to: '/search?cat=fashion&q=Accessories' },
    ],
  },
  {
    id: 'beauty',
    label: 'Beauty',
    to: '/search?cat=beauty',
    icon: '💄',
    subs: [
      { label: 'Skincare', to: '/search?cat=skincare' },
      { label: 'Makeup', to: '/search?cat=makeup' },
      { label: 'Hair Care', to: '/search?cat=haircare' },
      { label: 'Fragrances', to: '/search?cat=fragrances' },
      { label: 'Men Grooming', to: '/search?cat=mens-grooming' },
    ],
  },
  {
    id: 'home',
    label: 'Home & Kitchen',
    to: '/search?cat=home',
    icon: '🏠',
    subs: [
      { label: 'Furniture', to: '/search?cat=furniture' },
      { label: 'Kitchen Appliances', to: '/search?cat=kitchen' },
      { label: 'Bedding & Bath', to: '/search?cat=bedding' },
      { label: 'Home Décor', to: '/search?cat=decor' },
      { label: 'Lighting', to: '/search?cat=lighting' },
      { label: 'Storage & Organization', to: '/search?cat=storage' },
    ],
  },
  {
    id: 'mobiles',
    label: 'Mobiles',
    to: '/search?cat=mobiles',
    icon: '📱',
    subs: [
      { label: 'Smartphones', to: '/search?cat=smartphones' },
      { label: 'Feature Phones', to: '/search?cat=feature-phones' },
      { label: 'Mobile Accessories', to: '/search?cat=mobile-accessories' },
      { label: 'Power Banks', to: '/search?cat=powerbanks' },
      { label: 'Cases & Covers', to: '/search?cat=cases' },
    ],
  },
  {
    id: 'laptops',
    label: 'Laptops',
    to: '/search?cat=laptops',
    icon: '🖥️',
    subs: [
      { label: 'Business Laptops', to: '/search?cat=business-laptops' },
      { label: 'Gaming Laptops', to: '/search?cat=gaming-laptops' },
      { label: '2-in-1 Laptops', to: '/search?cat=2in1-laptops' },
      { label: 'Laptop Accessories', to: '/search?cat=laptop-accessories' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    to: '/search?cat=sports',
    icon: '🏃',
    subs: [
      { label: 'Fitness & Gym', to: '/search?cat=fitness' },
      { label: 'Outdoor & Camping', to: '/search?cat=outdoor' },
      { label: 'Cricket', to: '/search?cat=cricket' },
      { label: 'Football', to: '/search?cat=football' },
      { label: 'Yoga & Pilates', to: '/search?cat=yoga' },
    ],
  },
  {
    id: 'books',
    label: 'Books',
    to: '/search?cat=books',
    icon: '📚',
    subs: [
      { label: 'Fiction', to: '/search?cat=fiction' },
      { label: 'Non-Fiction', to: '/search?cat=nonfiction' },
      { label: 'Children\'s Books', to: '/search?cat=children-books' },
      { label: 'Academic & Education', to: '/search?cat=academic' },
      { label: 'Self Help', to: '/search?cat=self-help' },
    ],
  },
  {
    id: 'toys',
    label: 'Toys & Games',
    to: '/search?cat=toys',
    icon: '🧸',
    subs: [
      { label: 'Educational Toys', to: '/search?cat=educational' },
      { label: 'Action Figures', to: '/search?cat=action-figures' },
      { label: 'Board Games', to: '/search?cat=board-games' },
      { label: 'LEGO & Building', to: '/search?cat=lego' },
      { label: 'Outdoor Toys', to: '/search?cat=outdoor-toys' },
    ],
  },
]

const quickLinks = [
  { id: 'home', label: 'Home', to: '/', icon: '🏠' },
  { id: 'deals', label: "Today's Deals", to: '/search?cat=deals', icon: '⚡', badge: 'HOT' },
  { id: 'new', label: 'New Arrivals', to: '/search?cat=new', icon: '✨' },
  { id: 'trending', label: 'Trending Now', to: '/search?cat=trending', icon: '🔥' },
]

const accountLinks = [
  { id: 'wishlist', label: 'Wishlist', to: '/wishlist', icon: <HeartIcon size={15} /> },
  { id: 'orders', label: 'My Orders', to: '/dashboard', icon: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
  { id: 'account', label: 'My Account', to: '/dashboard', icon: <UserIcon size={15} /> },
]

export default function LeftSidebar({ collapsed, onToggle }: LeftSidebarProps) {
  const location = useLocation()
  const [openCat, setOpenCat] = useState<string | null>(null)
  const w = collapsed ? 64 : 248

  const toggleCat = (id: string) => {
    setOpenCat((prev) => (prev === id ? null : id))
  }

  const isRouteActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    const base = to.split('?')[0]
    return location.pathname.startsWith(base) && base !== '/'
  }

  return (
    <aside
      className="fixed left-0 bg-white flex flex-col"
      style={{
        top: 72,
        height: 'calc(100vh - 72px)',
        width: w,
        borderRight: '1px solid #f0f0f0',
        boxShadow: '1px 0 12px rgba(0,0,0,0.04)',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 40,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2.5 w-full h-11 px-4 shrink-0 hover:bg-gray-50 transition-all text-gray-500"
        style={{ borderBottom: '1px solid #f5f5f5' }}
        title={collapsed ? 'Expand menu' : 'Collapse menu'}
      >
        {menuIcon}
        {!collapsed && <span className="text-[13px] font-semibold text-gray-600">All Categories</span>}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">

        {/* Quick Links */}
        <div className="mb-1">
          {quickLinks.map((q) => {
            const active = q.to === '/' ? location.pathname === '/' : location.search.includes(q.to.split('?')[1] || '')
            return (
              <div key={q.id} className="relative group">
                <Link
                  to={q.to}
                  className="flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-xl transition-all"
                  style={{ backgroundColor: active ? '#fff5f7' : 'transparent', color: active ? '#E40046' : '#374151' }}
                >
                  <span className="text-[16px] shrink-0">{q.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="text-[13px] font-semibold flex-1">{q.label}</span>
                      {q.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#E40046' }}>{q.badge}</span>
                      )}
                    </>
                  )}
                </Link>
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: '#1a1a1a' }}>{q.label}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div className="mx-3 my-2 h-px bg-gray-100" />

        {/* Category label */}
        {!collapsed && (
          <p className="px-5 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Shop by Category</p>
        )}

        {/* Categories accordion */}
        {categories.map((cat) => {
          const isOpen = openCat === cat.id
          const isActive = isRouteActive(cat.to)
          return (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => !collapsed && toggleCat(cat.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 mx-auto transition-all rounded-xl"
                style={{
                  margin: collapsed ? '0 auto' : '0 6px',
                  width: collapsed ? '52px' : 'calc(100% - 12px)',
                  backgroundColor: isActive || isOpen ? '#fff5f7' : 'transparent',
                  color: isActive || isOpen ? '#E40046' : '#4b5563',
                }}
              >
                <span className="text-[17px] shrink-0">{cat.icon}</span>
                {!collapsed && (
                  <>
                    <span className="text-[13px] font-semibold flex-1 text-left">{cat.label}</span>
                    <span className="text-gray-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', display: 'flex', alignItems: 'center' }}>
                      {chevronRight}
                    </span>
                  </>
                )}
              </button>

              {/* Collapsed tooltip */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white rounded-2xl py-2 px-1 z-50 w-48 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity group-hover:pointer-events-auto"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f0f0f0' }}>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">{cat.label}</p>
                  {cat.subs.map((s) => (
                    <Link key={s.label} to={s.to}
                      className="flex items-center px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-red-50 hover:text-[#E40046] transition-all">
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Expanded subcategories with animation */}
              {!collapsed && (
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? `${cat.subs.length * 40}px` : '0px',
                    transition: 'max-height 0.25s cubic-bezier(0.4,0,0.2,1)',
                    marginLeft: 28,
                    borderLeft: isOpen ? '2px solid #fce7f3' : '2px solid transparent',
                  }}
                >
                  {cat.subs.map((s) => (
                    <Link
                      key={s.label}
                      to={s.to}
                      className="flex items-center gap-2 px-3 py-2 rounded-r-xl text-[12px] font-medium text-gray-600 hover:bg-red-50 hover:text-[#E40046] transition-all"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Divider */}
        <div className="mx-3 my-2 h-px bg-gray-100" />

        {/* Account links */}
        {!collapsed && <p className="px-5 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">My Account</p>}
        {accountLinks.map((a) => (
          <div key={a.id} className="relative group">
            <Link to={a.to}
              className="flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-xl transition-all text-gray-600 hover:text-[#E40046] hover:bg-red-50">
              <span className="shrink-0 text-gray-500">{a.icon}</span>
              {!collapsed && <span className="text-[13px] font-semibold">{a.label}</span>}
            </Link>
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: '#1a1a1a' }}>{a.label}</div>
            )}
          </div>
        ))}
      </div>

      {/* Flash sale promo */}
      {!collapsed && (
        <div className="p-3 shrink-0">
          <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #fff5f7, #fdf4ff)', border: '1px solid #fce7f3' }}>
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon size={13} className="text-[#E40046]" />
              <p className="text-[11px] font-extrabold text-[#E40046]">Flash Sale Live!</p>
            </div>
            <p className="text-[10px] text-gray-500">Up to 80% off on top brands</p>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="p-2 shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #E40046, #c9003c)' }}>
            <ZapIcon size={16} fill="white" stroke="none" />
          </div>
        </div>
      )}
    </aside>
  )
}
