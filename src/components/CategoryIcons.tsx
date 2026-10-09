import { Link } from 'react-router-dom'

interface Category {
  icon: string | null
  img?: string
  label: string
  slug: string
  bg: string
}

const categories: Category[] = [
  { icon: null, img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=128&h=128&fit=crop&auto=format', label: 'Fashion', slug: 'fashion', bg: '#fff5f7' },
  { icon: null, img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=128&h=128&fit=crop&auto=format', label: 'Mobiles', slug: 'mobiles', bg: '#f0f4ff' },
  { icon: null, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=128&h=128&fit=crop&auto=format', label: 'Electronics', slug: 'electronics', bg: '#f0fff4' },
  { icon: null, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=128&h=128&fit=crop&auto=format', label: 'Beauty', slug: 'beauty', bg: '#fff9f0' },
  { icon: null, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=128&h=128&fit=crop&auto=format', label: 'Home', slug: 'home', bg: '#f5f0ff' },
  { icon: null, img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=128&h=128&fit=crop&auto=format', label: 'Sports', slug: 'sports', bg: '#fff0f0' },
  { icon: null, img: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=128&h=128&fit=crop&auto=format', label: 'Appliances', slug: 'appliances', bg: '#f0f9ff' },
  { icon: null, img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&auto=format', label: 'Books', slug: 'books', bg: '#fdf4ff' },
  { icon: null, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=128&h=128&fit=crop&auto=format', label: 'Furniture', slug: 'furniture', bg: '#fff8f0' },
  { icon: null, img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=128&h=128&fit=crop&auto=format', label: 'Toys', slug: 'toys', bg: '#f0fff0' },
]

export default function CategoryIcons() {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">Shop by Category</h2>
        <Link to="/search" className="text-sm font-semibold hover:underline" style={{ color: '#E40046' }}>
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            to={`/search?cat=${cat.slug}`}
            className="flex flex-col items-center gap-2.5 group cursor-pointer"
          >
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg flex items-center justify-center text-3xl"
              style={{
                backgroundColor: cat.bg,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {cat.img ? (
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
              ) : (
                cat.icon
              )}
            </div>
            <span className="text-xs font-semibold text-gray-600 group-hover:text-[#E40046] transition-colors text-center leading-tight">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
