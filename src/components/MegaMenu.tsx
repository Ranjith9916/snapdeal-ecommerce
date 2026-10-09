import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchIcon, ZapIcon } from './Icons'

interface MegaMenuProps {
  open: boolean
  onClose: () => void
}

interface MegaMenuProduct {
  name: string
  img: string
  rating: number
  price: string
  original: string
  discount: string
}

interface MegaMenuCategory {
  key: string
  icon: string
  title: string
  sub: string[][]
  brands: string[]
  products: MegaMenuProduct[]
}

const shortcuts = [
  "Today's Deals", 'Best Sellers', 'Under ₹499', 'Budget Picks',
  'Express Delivery', 'Trending', 'New Arrivals', 'Student Offers',
]

const categories: MegaMenuCategory[] = [
  {
    key: 'electronics', icon: '📱', title: 'Electronics',
    sub: [
      ['Mobiles', 'Laptops', 'Headphones', 'Gaming'],
      ['Smart Watches', 'Cameras', 'Power Banks', 'Accessories'],
    ],
    brands: ['Samsung', 'Apple', 'Sony', 'OnePlus', 'Xiaomi', 'boAt'],
    products: [
      {
        name: 'vivo X100 Pro 5G',
        img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300',
        rating: 4.6,
        price: '₹89,999',
        original: '₹99,999',
        discount: '10%',
      },
      {
        name: 'Apple iPhone 15 Pro 128GB',
        img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
        rating: 4.8,
        price: '₹1,27,990',
        original: '₹1,34,900',
        discount: '5%',
      },
      {
        name: 'Sony WH-1000XM5 ANC Headphones',
        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        rating: 4.7,
        price: '₹26,990',
        original: '₹34,990',
        discount: '23%',
      },
    ],
  },
  {
    key: 'fashion', icon: '👗', title: 'Fashion',
    sub: [
      ['Traditional Wear', "Women's Wear", "Men's Wear", "Kids' Ethnic", 'Footwear'],
      ['Bags', 'Watches', 'Sunglasses', 'Jewellery'],
    ],
    brands: ['Zara', "Levi's", 'H&M', 'Puma', 'Adidas', 'Nike'],
    products: [
      {
        name: "Levi's 511 Slim Fit Jeans",
        img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300',
        rating: 4.5,
        price: '₹2,199',
        original: '₹3,999',
        discount: '45%',
      },
      {
        name: 'Peter England Men Slim Fit Casual Shirt',
        img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
        rating: 4.3,
        price: '₹999',
        original: '₹1,799',
        discount: '44%',
      },
    ],
  },
  {
    key: 'home', icon: '🏠', title: 'Home & Kitchen',
    sub: [
      ['Cookware', 'Storage', 'Bedding', 'Decor'],
      ['Furniture', 'Lighting', 'Bath', 'Cleaning'],
    ],
    brands: ['Prestige', 'Philips', 'Milton', 'Bosch', 'Hindware', 'Hafele'],
    products: [
      {
        name: 'Prestige Iris Plus 750W Mixer Grinder',
        img: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300',
        rating: 4.4,
        price: '₹2,999',
        original: '₹6,295',
        discount: '52%',
      },
      {
        name: 'Milton Thermosteel Flip Lid Flask 1000ml',
        img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300',
        rating: 4.6,
        price: '₹949',
        original: '₹1,190',
        discount: '20%',
      },
    ],
  },
  {
    key: 'beauty', icon: '💄', title: 'Beauty',
    sub: [
      ['Skincare', 'Makeup', 'Haircare', 'Fragrances'],
      ["Men's Grooming", 'Wellness', 'Nail Care', 'Tools'],
    ],
    brands: ["L'Oreal", 'Lakme', 'Mamaearth', 'Minimalist', 'Plum', 'Biotique'],
    products: [
      {
        name: 'Minimalist 10% Niacinamide Face Serum',
        img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300',
        rating: 4.5,
        price: '₹599',
        original: '₹699',
        discount: '14%',
      },
      {
        name: 'The Derma Co 1% Hyaluronic Sunscreen Aqua Gel',
        img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300',
        rating: 4.6,
        price: '₹449',
        original: '₹499',
        discount: '10%',
      },
    ],
  },
  {
    key: 'sports', icon: '⚽', title: 'Sports',
    sub: [
      ['Footwear', 'Cricket', 'Badminton', 'Fitness'],
      ['Cycling', 'Yoga', 'Swimming', 'Outdoor'],
    ],
    brands: ['Nike', 'Puma', 'Adidas', 'Cosco', 'Yonex', 'Decathlon'],
    products: [
      {
        name: 'Yonex Nanoray Light 18i Badminton Racquet',
        img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300',
        rating: 4.4,
        price: '₹1,899',
        original: '₹2,990',
        discount: '36%',
      },
    ],
  },
  {
    key: 'books', icon: '📚', title: 'Books',
    sub: [
      ['Fiction', 'Self Help', 'Business', "Children's"],
      ['Academic', 'Comics', 'Biography', 'Science'],
    ],
    brands: ['Penguin', 'Harper Collins', 'Westland', 'Rupa', 'S. Chand', 'Notion Press'],
    products: [
      {
        name: 'Atomic Habits by James Clear',
        img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
        rating: 4.8,
        price: '₹499',
        original: '₹799',
        discount: '38%',
      },
    ],
  },
  {
    key: 'toys', icon: '🧸', title: 'Toys & Baby',
    sub: [
      ['Building Blocks', 'Dolls', 'RC Toys', 'Board Games'],
      ['Baby Gear', 'Outdoor', 'STEM Kits', 'Soft Toys'],
    ],
    brands: ['Lego', 'Hot Wheels', 'Fisher-Price', 'Barbie', 'Funskool', 'Hasbro'],
    products: [
      {
        name: 'Lego Classic Large Creative Brick Box',
        img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300',
        rating: 4.8,
        price: '₹3,499',
        original: '₹4,499',
        discount: '22%',
      },
    ],
  },
]

export default function MegaMenu({ open, onClose }: MegaMenuProps) {
  const [active, setActive] = useState('electronics')
  const [catSearch, setCatSearch] = useState('')
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const cat = categories.find((c) => c.key === active) ?? categories[0]

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => onClose(), 500)
  }
  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current) }, [])

  if (!open) return null

  const filteredSubs = catSearch
    ? cat.sub.flat().filter((s) => s.toLowerCase().includes(catSearch.toLowerCase()))
    : null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" style={{ top: 112, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} onClick={onClose} />

      {/* Floating panel */}
      <div
        className="fixed z-40 bg-white"
        style={{
          top: 112,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92vw',
          maxWidth: 1320,
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.14)',
          border: '1px solid #f0f0f0',
          animation: 'megaIn 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Quick shortcuts */}
        <div
          className="flex items-center gap-2 px-6 py-3 overflow-x-auto"
          style={{ borderBottom: '1px solid #f5f5f5' }}
        >
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap mr-1">Quick:</span>
          {shortcuts.map((s) => (
            <Link
              key={s}
              to={`/search?q=${encodeURIComponent(s)}`}
              onClick={onClose}
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:bg-red-50 hover:text-[#E40046]"
              style={{ backgroundColor: '#f8f8f8', color: '#555' }}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Content body */}
        <div className="flex" style={{ minHeight: 420, maxHeight: 520 }}>
          {/* Left — category list 22% */}
          <div className="shrink-0 overflow-y-auto py-3" style={{ width: '22%', borderRight: '1px solid #f5f5f5' }}>
            {categories.map((c) => (
              <button
                key={c.key}
                onMouseEnter={() => { setActive(c.key); setCatSearch('') }}
                onClick={() => { navigate(`/search?cat=${encodeURIComponent(c.title)}`); onClose(); }}
                className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all hover:bg-gray-50"
                style={{
                  backgroundColor: active === c.key ? '#fff5f7' : 'transparent',
                  borderRight: active === c.key ? '3px solid #E40046' : '3px solid transparent',
                }}
              >
                <span className="text-xl">{c.icon}</span>
                <span
                  className="text-[15px] font-semibold"
                  style={{ color: active === c.key ? '#E40046' : '#333' }}
                >
                  {c.title}
                </span>
              </button>
            ))}
          </div>

          {/* Middle — subcategories 43% */}
          <div className="flex flex-col overflow-y-auto py-5 px-6" style={{ width: '43%', borderRight: '1px solid #f5f5f5' }}>
            {/* Search inside category */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5"
              style={{ backgroundColor: '#f8f8f8', border: '1px solid #eee' }}
            >
              <SearchIcon size={14} className="text-gray-400 shrink-0" />
              <input
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder={`Search in ${cat.title}…`}
                className="text-[13px] font-medium text-gray-700 placeholder-gray-400 bg-transparent outline-none w-full"
              />
            </div>

            {filteredSubs ? (
              <div className="flex flex-wrap gap-2">
                {filteredSubs.map((s) => (
                  <Link
                    key={s}
                    to={`/search?q=${encodeURIComponent(s)}`}
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl text-[14px] font-medium bg-red-50 text-[#E40046] hover:bg-[#E40046] hover:text-white transition-all"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                {cat.sub.map((col, ci) => (
                  <div key={ci}>
                    {col.map((sub) => (
                      <Link
                        key={sub}
                        to={`/search?q=${encodeURIComponent(sub)}`}
                        onClick={onClose}
                        className="flex items-center gap-2 py-2 text-[15px] font-medium text-gray-700 hover:text-[#E40046] transition-colors"
                        style={{ lineHeight: 1.5 }}
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                        {sub}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Brands */}
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid #f0f0f0' }}>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Popular Brands</p>
              <div className="flex flex-wrap gap-2">
                {cat.brands.map((b) => (
                  <Link
                    key={b}
                    to={`/search?q=${encodeURIComponent(b)}`}
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all hover:bg-red-50 hover:text-[#E40046]"
                    style={{ backgroundColor: '#f5f5f5', color: '#444' }}
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right — trending products 35% */}
          <div className="flex-1 overflow-y-auto py-5 px-5">
            <div className="flex items-center gap-2 mb-4">
              <ZapIcon size={14} fill="#E40046" stroke="none" />
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trending in {cat.title}</p>
            </div>

            <div className="flex flex-col gap-3">
              {cat.products.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { navigate(`/search?q=${encodeURIComponent(p.name)}`); onClose(); }}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:-translate-y-0.5 hover:shadow-md group"
                  style={{ border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}
                >
                  <img src={p.img} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 leading-snug truncate group-hover:text-[#E40046]">{p.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#22c55e' }}>
                        ★ {p.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[14px] font-extrabold text-gray-900">{p.price}</span>
                      <span className="text-[11px] text-gray-400 line-through">{p.original}</span>
                      <span className="text-[11px] font-bold text-green-600">{p.discount} off</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Featured deal card */}
            <div
              className="mt-4 p-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #fff0f4 0%, #fdf4ff 100%)', border: '1px solid #fce7f3' }}
            >
              <p className="text-[11px] font-bold text-[#E40046] mb-1">⚡ Flash Sale on {cat.title}</p>
              <p className="text-[18px] font-extrabold text-gray-800">Up to 80% off</p>
              <button
                onClick={() => { navigate(`/search?cat=${encodeURIComponent(cat.title)}`); onClose(); }}
                className="mt-3 w-full py-2.5 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#E40046' }}
              >
                Shop Flash Deals →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes megaIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  )
}
