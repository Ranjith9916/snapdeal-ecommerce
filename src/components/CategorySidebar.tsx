import { Link } from 'react-router-dom'
import { CloseIcon, ChevronRightIcon } from './Icons'

interface CategorySidebarProps {
  open: boolean
  onClose: () => void
}

const categories = [
  { icon: '👗', label: 'Fashion', slug: 'fashion', count: '2M+ products' },
  { icon: '📱', label: 'Mobiles', slug: 'mobiles', count: '50K+ products' },
  { icon: '💻', label: 'Electronics', slug: 'electronics', count: '120K+ products' },
  { icon: '💄', label: 'Beauty', slug: 'beauty', count: '80K+ products' },
  { icon: '🏠', label: 'Home & Kitchen', slug: 'home', count: '200K+ products' },
  { icon: '🏃', label: 'Sports', slug: 'sports', count: '60K+ products' },
  { icon: '🏎️', label: 'Automotive', slug: 'automotive', count: '40K+ products' },
  { icon: '⚡', label: 'Appliances', slug: 'appliances', count: '30K+ products' },
  { icon: '🔥', label: "Today's Deals", slug: 'deals', count: 'Limited time' },
  { icon: '✨', label: 'New Arrivals', slug: 'new', count: 'Fresh picks' },
]

export default function CategorySidebar({ open, onClose }: CategorySidebarProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 left-0 h-full z-50 bg-white flex flex-col"
        style={{
          width: 320,
          boxShadow: '4px 0 40px rgba(0,0,0,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #f0f0f0', background: 'linear-gradient(135deg, #E40046 0%, #c0003a 100%)' }}
        >
          <div>
            <p className="text-white font-bold text-lg">All Categories</p>
            <p className="text-red-200 text-xs mt-0.5">Shop by your interest</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/search?cat=${cat.slug}`}
              onClick={onClose}
              className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-red-50 hover:text-[#E40046] transition-all group text-left"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-800 group-hover:text-[#E40046]">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
              </div>
              <ChevronRightIcon size={16} className="text-gray-300 group-hover:text-[#E40046]" />
            </Link>
          ))}
        </div>

        <div
          className="px-6 py-4 mx-4 mb-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #ffe8ee 100%)', border: '1px solid #fecdd3' }}
        >
          <p className="text-[#E40046] font-bold text-sm">🎉 Flash Sale Live!</p>
          <p className="text-gray-600 text-xs mt-1">Up to 80% off on top brands</p>
        </div>
      </div>
    </>
  )
}
