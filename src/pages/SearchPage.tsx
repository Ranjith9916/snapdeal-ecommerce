import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { StarIcon, HeartIcon, CartIcon, ChevronRightIcon } from '../components/Icons'
import Footer from '../components/Footer'
import { SkeletonRow } from '../components/SkeletonCard'
import { 
  getProducts, 
  getDealsProducts, 
  getNewArrivalsProducts,
  searchProducts, 
  getCategories, 
  ProductModel, 
  isMenProduct, 
  isWomenProduct, 
  isKidsProduct,
  FASHION_CATEGORY_ID,
  FOOTWEAR_CATEGORY_ID,
  WATCHES_CATEGORY_ID,
  MOBILES_CATEGORY_ID,
  LAPTOPS_CATEGORY_ID,
  ELECTRONICS_CATEGORY_ID,
  HOME_CATEGORY_ID,
  SPORTS_CATEGORY_ID,
  BEAUTY_CATEGORY_ID,
  TOYS_CATEGORY_ID
} from '../services/products'
import { useWishlist } from '../contexts/WishlistContext'

const sortOptions = ['Popularity', 'Newest', 'Price: Low → High', 'Price: High → Low', 'Customer Rating', 'Biggest Discount']

const categoryLabels: Record<string, string> = {
  mobiles: 'Mobiles & Smartphones', smartphones: 'Smartphones', laptops: 'Laptops & Computers',
  electronics: 'Electronics', audio: 'Audio & Speakers', cameras: 'Cameras',
  fashion: 'Fashion', mens: "Men's Fashion", womens: "Women's Fashion",
  'kids-fashion': "Kids' Fashion", clothing: 'Fashion & Clothing', apparel: 'Apparel',
  'fashion-accessories': 'Fashion Accessories',
  traditional: 'Traditional & Ethnic Indian Wear', 'traditional-wear': 'Traditional & Ethnic Indian Wear',
  ethnic: 'Traditional & Ethnic Indian Wear', 'ethnic-wear': 'Traditional & Ethnic Indian Wear',
  'mens-traditional': "Men's Traditional & Ethnic Wear", 'womens-traditional': "Women's Traditional & Ethnic Wear", 'kids-traditional': "Kids' Traditional & Ethnic Wear",
  footwear: 'Footwear & Shoes', shoes: 'Shoes', beauty: 'Beauty & Personal Care',
  skincare: 'Skincare & Serums', makeup: 'Makeup & Cosmetics', haircare: 'Haircare & Styling',
  fragrances: 'Luxury Fragrances', 'bath-body': 'Bath & Body Care', cosmetics: 'Cosmetics',
  home: 'Home & Kitchen', furniture: 'Furniture', kitchen: 'Kitchen Appliances',
  sports: 'Sports & Fitness', fitness: 'Fitness Equipment', yoga: 'Yoga & Pilates',
  cricket: 'Cricket Equipment & Gear', badminton: 'Badminton Gear & Rackets', football: 'Football & Soccer Gear',
  cycling: 'Cycling & Accessories', swimming: 'Swimming & Water Sports', outdoor: 'Outdoor & Adventure Gear',
  gym: 'Gym & Workout Equipment',
  books: 'Books', fiction: 'Fiction Books', 'self-help': 'Self Help Books',
  watches: 'Watches', deals: "Today's Best Deals", flash: "Flash Deals", trending: 'Trending Now', new: 'New Arrivals',
  toys: 'Toys & Games', lego: 'LEGO & Building Blocks', 'board-games': 'Board Games & Puzzles',
  educational: 'Educational & STEM Toys', 'rc-toys': 'RC & Remote Control Toys',
  'soft-toys': 'Soft Toys & Baby Toys', 'outdoor-toys': 'Outdoor & Sports Toys', 'arts-crafts': 'Arts & Crafts',
}

// Subcategory & alias mapping to parent category slugs in Supabase
export const CATEGORY_ALIAS_MAP: Record<string, string> = {
  // Deals & Special
  deals: 'deals',
  flash: 'deals',
  'todays-deals': 'deals',
  'today-deals': 'deals',
  // New Arrivals
  new: 'new',
  'new-arrivals': 'new',
  'newarrivals': 'new',
  arrivals: 'new',
  // Fashion subcategories
  fashion: 'fashion',
  womens: 'fashion',
  mens: 'fashion',
  'kids-fashion': 'fashion',
  clothing: 'fashion',
  apparel: 'fashion',
  'fashion-accessories': 'fashion',
  bags: 'fashion',
  ethnic: 'fashion',
  'ethnic-wear': 'fashion',
  traditional: 'fashion',
  'traditional-wear': 'fashion',
  'mens-traditional': 'fashion',
  'womens-traditional': 'fashion',
  'kids-traditional': 'fashion',
  // Mobiles
  mobiles: 'mobiles',
  smartphones: 'mobiles',
  'feature-phones': 'mobiles',
  'mobile-accessories': 'mobiles',
  powerbanks: 'mobiles',
  cases: 'mobiles',
  // Laptops
  laptops: 'laptops',
  computers: 'laptops',
  'business-laptops': 'laptops',
  'gaming-laptops': 'laptops',
  '2in1-laptops': 'laptops',
  'laptop-accessories': 'laptops',
  // Electronics
  electronics: 'electronics',
  audio: 'electronics',
  cameras: 'electronics',
  gaming: 'electronics',
  accessories: 'electronics',
  // Footwear
  footwear: 'footwear',
  shoes: 'footwear',
  sneakers: 'footwear',
  // Watches
  watches: 'watches',
  smartwatches: 'watches',
  // Beauty
  beauty: 'beauty',
  skincare: 'beauty',
  makeup: 'beauty',
  haircare: 'beauty',
  fragrances: 'beauty',
  fragrance: 'beauty',
  perfume: 'beauty',
  perfumes: 'beauty',
  'bath-body': 'beauty',
  bath: 'beauty',
  bodycare: 'beauty',
  cosmetics: 'beauty',
  'personal-care': 'beauty',
  'mens-grooming': 'beauty',
  // Home & Kitchen
  home: 'home',
  kitchen: 'home',
  furniture: 'home',
  bedding: 'home',
  decor: 'home',
  'home-decor': 'home',
  lighting: 'home',
  storage: 'home',
  appliances: 'home',
  cookware: 'home',
  'home-kitchen': 'home',
  // Sports
  sports: 'sports',
  fitness: 'sports',
  outdoor: 'sports',
  cricket: 'sports',
  badminton: 'sports',
  football: 'sports',
  cycling: 'sports',
  yoga: 'sports',
  swimming: 'sports',
  gym: 'sports',
  // Books
  books: 'books',
  fiction: 'books',
  nonfiction: 'books',
  'children-books': 'books',
  academic: 'books',
  'self-help': 'books',
  // Toys & Games
  toys: 'toys',
  lego: 'toys',
  'building-blocks': 'toys',
  'action-figures': 'toys',
  dolls: 'toys',
  'board-games': 'toys',
  puzzles: 'toys',
  educational: 'toys',
  'stem-toys': 'toys',
  'rc-toys': 'toys',
  'remote-control': 'toys',
  'soft-toys': 'toys',
  'baby-toys': 'toys',
  'outdoor-toys': 'toys',
  'arts-crafts': 'toys',
  games: 'toys',
}

// Simple typo correction map
const typoMap: Record<string, string> = {
  'iphnoe': 'iPhone', 'iphoe': 'iPhone', 'iphone': 'iPhone',
  'samsng': 'Samsung', 'samaung': 'Samsung',
  'nikee': 'Nike', 'nik shoes': 'Nike shoes',
  'adidass': 'Adidas', 'addidas': 'Adidas',
  'laptp': 'laptop', 'loptop': 'laptop',
  'heaphones': 'headphones', 'headhpones': 'headphones',
  'earphons': 'earphones',
}

function didYouMean(q: string): string | null {
  const low = q.toLowerCase()
  for (const [typo, fix] of Object.entries(typoMap)) {
    if (low.includes(typo)) return q.replace(new RegExp(typo, 'gi'), fix)
  }
  return null
}

const quickFilters = [
  { label: 'Under ₹500', filter: (p: ProductModel) => p.price < 500 },
  { label: 'Under ₹1,000', filter: (p: ProductModel) => p.price < 1000 },
  { label: 'Under ₹5,000', filter: (p: ProductModel) => p.price < 5000 },
  { label: '4★ & above', filter: (p: ProductModel) => (p.rating ?? 4.5) >= 4 },
  { label: 'Best Sellers', filter: (p: ProductModel) => (p.reviews ?? 100) > 500 },
  { label: '50%+ off', filter: (p: ProductModel) => p.discount >= 50 },
]

function RangeSlider({ min, max, value, onChange }: { min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#E40046]" />
      <div className="flex justify-between text-[11px] text-gray-500 mt-1 font-medium">
        <span>₹{min.toLocaleString()}</span><span>₹{value.toLocaleString()}</span>
      </div>
    </div>
  )
}

function FilterBox({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-white">
        <span className="text-[14px] font-bold text-gray-800">{title}</span>
        <span className="text-gray-400 text-lg leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-2 bg-white">{children}</div>}
    </div>
  )
}

import { useCart } from '../contexts/CartContext'

function GridCard({ product: p, wishlisted, onWishlist }: { product: ProductModel; wishlisted: boolean; onWishlist: () => void }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  // Mock rating since it's not in products table
  const rating = 4.5
  const reviewsCount = 1200
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#f97316' : '#ef4444'
  
  const images = p.images && p.images.length > 0
    ? p.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format']
  
  // When card is hovered without manual dot selection, show 2nd style (model/lifestyle), otherwise activeImgIndex
  const currentDisplayIndex = isHovered && activeImgIndex === 0 && images.length > 1 ? 1 : activeImgIndex
  const currentImg = images[currentDisplayIndex] || images[0]
  const badge = p.stock_quantity < 10 ? 'Low Stock' : null
  
  const handleAddToCart = async () => {
    const { success } = await addToCart(p.id, 1)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden group transition-all duration-200 hover:-translate-y-1 flex flex-col"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setActiveImgIndex(0)
      }}
    >
      <Link to={`/product/${p.id}`} className="relative overflow-hidden block bg-gray-50" style={{ height: 200 }}>
        <img
          src={currentImg}
          alt={p.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format';
          }}
          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />
        {badge && <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-[10px] font-bold rounded-full z-10" style={{ backgroundColor: '#E40046' }}>{badge}</span>}
        <span className="absolute top-3 right-3 px-2.5 py-1 text-white text-[10px] font-bold rounded-full z-10" style={{ backgroundColor: '#22c55e' }}>-{p.discount}%</span>
        
        {/* Real-world Multi-Style Perspective Pill */}
        {images.length > 1 && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-bold text-gray-700 bg-white/95 backdrop-blur-md rounded-md shadow-xs border border-gray-200/80 flex items-center gap-1 z-10 transition-opacity">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            {images.length} Styles
          </span>
        )}

        {/* Real-world Style Scrubber Dots */}
        {images.length > 1 && isHovered && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
            {images.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveImgIndex(idx)
                }}
                onMouseEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveImgIndex(idx)
                }}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentDisplayIndex === idx ? 'w-4 bg-[#E40046]' : 'w-1.5 bg-gray-400/80 hover:bg-gray-700'
                }`}
                title={`Style view ${idx + 1}`}
                aria-label={`Style view ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <button onClick={(e) => { e.preventDefault(); onWishlist() }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
          style={{ border: '1px solid #f0f0f0' }}>
          <HeartIcon size={14} fill={wishlisted ? '#E40046' : 'none'} stroke={wishlisted ? '#E40046' : '#999'} />
        </button>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: '#E40046' }}>{p.brand}</p>
        <Link to={`/product/${p.id}`}>
          <p className="text-[12px] font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2 hover:text-[#E40046] transition-colors">{p.name}</p>
        </Link>
        {p.specs && p.specs['State / Region'] && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 inline-flex items-center gap-1 w-fit mb-1.5">
            🥻 {p.specs['State / Region']}
          </span>
        )}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-white text-[10px] font-bold" style={{ backgroundColor: ratingColor }}>
            <StarIcon size={9} fill="white" stroke="none" /> {rating}
          </span>
          <span className="text-[10px] text-gray-400">({reviewsCount.toLocaleString()})</span>
        </div>
        <p className="text-[10px] text-gray-400 mb-1.5">🚚 {p.delivery || 'Tomorrow'}</p>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-[16px] font-extrabold text-gray-900">₹{p.price.toLocaleString()}</span>
          <span className="text-[11px] text-gray-400 line-through">₹{p.original_price.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-green-600">Save ₹{(p.original_price - p.price).toLocaleString()}</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleAddToCart}
            className="flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
            style={{ backgroundColor: added ? '#22c55e' : '#E40046', color: '#fff' }}>
            <CartIcon size={11} /> {added ? 'Added!' : 'Add to Cart'}
          </button>
          <Link to={`/product/${p.id}`} className="flex-1">
            <button className="w-full py-2 rounded-xl text-[11px] font-bold transition-all hover:bg-red-50"
              style={{ border: '1.5px solid #E40046', color: '#E40046' }}>
              Buy Now
            </button>
          </Link>
          <button onClick={onWishlist} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 shrink-0"
            style={{ border: '1px solid #f0f0f0' }}>
            <HeartIcon size={14} fill={wishlisted ? '#E40046' : 'none'} stroke={wishlisted ? '#E40046' : '#999'} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ListCard({ product: p, wishlisted, onWishlist }: { product: ProductModel; wishlisted: boolean; onWishlist: () => void }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  // Mock rating since it's not in products table
  const rating = 4.5
  const reviewsCount = 1200
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#f97316' : '#ef4444'
  
  const images = p.images && p.images.length > 0
    ? p.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format']
  
  const currentDisplayIndex = isHovered && activeImgIndex === 0 && images.length > 1 ? 1 : activeImgIndex
  const currentImg = images[currentDisplayIndex] || images[0]
  const badge = p.stock_quantity < 10 ? 'Low Stock' : null
  const delivery = 'Tomorrow'
  
  const handleAddToCart = async () => {
    const { success } = await addToCart(p.id, 1)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden group transition-all flex border border-gray-100 hover:border-[#E40046] hover:shadow-lg"
      style={{ height: 180 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setActiveImgIndex(0)
      }}
    >
      <Link to={`/product/${p.id}`} className="relative bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden" style={{ width: 180 }}>
        <img
          src={currentImg}
          alt={p.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format';
          }}
          className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        {badge && <span className="absolute top-3 left-3 px-2 py-1 text-white text-[9px] font-bold rounded-sm uppercase tracking-wider z-10" style={{ backgroundColor: '#E40046' }}>{badge}</span>}
        
        {images.length > 1 && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[9px] font-bold text-gray-700 bg-white/95 rounded shadow-xs z-10">
            {images.length} Styles
          </span>
        )}

        {images.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1 z-20">
            {images.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveImgIndex(idx)
                }}
                onMouseEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveImgIndex(idx)
                }}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentDisplayIndex === idx ? 'w-3 bg-[#E40046]' : 'w-1.5 bg-gray-400'
                }`}
                title={`Style ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col justify-center border-l border-gray-50">
        <p className="text-[11px] font-bold mb-0.5 uppercase tracking-wider" style={{ color: '#E40046' }}>{p.brand}</p>
        <Link to={`/product/${p.id}`}><p className="text-[15px] font-semibold text-gray-800 hover:text-[#E40046] transition-colors mb-1">{p.name}</p></Link>
        {p.specs && p.specs['State / Region'] && (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 inline-flex items-center gap-1 w-fit mb-1.5">
            🥻 {p.specs['State / Region']} · {p.specs['Traditional Dress Type'] || 'Traditional Attire'}
          </span>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-white text-[11px] font-bold" style={{ backgroundColor: ratingColor }}>
            <StarIcon size={10} fill="white" stroke="none" /> {rating}
          </span>
          <span className="text-[12px] text-gray-400">{reviewsCount.toLocaleString()} reviews</span>
          <span className="text-[11px] font-semibold" style={{ color: '#22c55e' }}>{p.discount}% off</span>
        </div>
        <p className="text-[12px] text-gray-400 mb-2">🚚 {delivery} · ✔ 7-day return · ✔ Verified Seller</p>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[20px] font-extrabold text-gray-900">₹{p.price.toLocaleString()}</span>
          <span className="text-[13px] text-gray-400 line-through">₹{p.original_price.toLocaleString()}</span>
          <span className="text-[12px] font-bold text-green-600">Save ₹{(p.original_price - p.price).toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAddToCart}
            className="px-5 py-2 rounded-xl text-[12px] font-bold text-white transition-all flex items-center gap-1.5"
            style={{ backgroundColor: added ? '#22c55e' : '#E40046' }}>
            <CartIcon size={13} /> {added ? '✓ Added' : 'Add to Cart'}
          </button>
          <Link to={`/product/${p.id}`}>
            <button className="px-5 py-2 rounded-xl text-[12px] font-bold transition-all hover:bg-red-50"
              style={{ border: '1.5px solid #E40046', color: '#E40046' }}>Buy Now</button>
          </Link>
          <button onClick={onWishlist}
            className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:bg-red-50"
            style={{ border: '1px solid #eee', color: wishlisted ? '#E40046' : '#666' }}>
            {wishlisted ? '♥ Saved' : '♡ Wishlist'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [params, setSearchParams] = useSearchParams()
  const cat = params.get('cat') || ''
  const query = params.get('q') || ''
  const sub = params.get('sub') || ''
  const gender = params.get('gender') || ''

  const catLower = cat.toLowerCase().trim()
  const queryLower = query.toLowerCase().trim()
  const subLower = sub.toLowerCase().trim()
  const genderLower = gender.toLowerCase().trim()

  const isTraditionalTarget = 
    catLower === 'traditional' || 
    catLower === 'traditional-wear' || 
    catLower === 'ethnic' || 
    catLower === 'ethnic-wear' ||
    catLower === 'mens-traditional' ||
    catLower === 'womens-traditional' ||
    catLower === 'kids-traditional' ||
    subLower === 'traditional' || 
    subLower === 'ethnic' ||
    queryLower === 'traditional' ||
    queryLower === 'traditional wear' ||
    queryLower === 'ethnic wear' ||
    queryLower === 'ethnic' ||
    queryLower.includes('traditional dress') ||
    queryLower.includes('traditional wear');

  const isMenTarget = 
    catLower === 'mens' || 
    catLower === 'men' ||
    catLower === 'mens-traditional' ||
    genderLower === 'men' ||
    genderLower === 'mens' ||
    subLower === 'men' ||
    subLower === 'mens' ||
    (catLower === 'fashion' && (queryLower === 'men' || queryLower === 'mens' || queryLower === "men's" || queryLower === "men's clothing" || queryLower === "mens clothing")) ||
    (isTraditionalTarget && (queryLower === 'men' || queryLower === 'mens' || queryLower === "men's" || queryLower.includes('men traditional') || queryLower.includes('mens traditional'))) ||
    /\b(men's clothing|mens clothing)\b/i.test(queryLower);

  const isWomenTarget = 
    catLower === 'womens' || 
    catLower === 'women' ||
    catLower === 'womens-traditional' ||
    genderLower === 'women' ||
    genderLower === 'womens' ||
    subLower === 'women' ||
    subLower === 'womens' ||
    (catLower === 'fashion' && (queryLower === 'women' || queryLower === 'womens' || queryLower === "women's" || queryLower === "women's clothing" || queryLower === "womens clothing")) ||
    (isTraditionalTarget && (queryLower === 'women' || queryLower === 'womens' || queryLower === "women's" || queryLower.includes('women traditional') || queryLower.includes('womens traditional') || queryLower.includes('saree') || queryLower.includes('lehenga'))) ||
    /\b(women's clothing|womens clothing)\b/i.test(queryLower);

  const isKidsTarget = 
    catLower === 'kids-fashion' || 
    catLower === 'kids' ||
    catLower === 'kids-traditional' ||
    genderLower === 'kids' ||
    subLower === 'kids' ||
    (catLower === 'fashion' && (queryLower === 'kids' || queryLower === "kids' fashion" || queryLower === "kids clothing")) ||
    (isTraditionalTarget && (queryLower === 'kids' || queryLower === "kids' fashion" || queryLower.includes('kids traditional') || queryLower.includes('boy') || queryLower.includes('girl'))) ||
    /\b(kids' fashion|kids fashion|kids clothing)\b/i.test(queryLower);

  const isDealsTarget = 
    catLower === 'deals' || 
    catLower === 'flash' || 
    catLower === 'today-deals' || 
    catLower === 'todays-deals' || 
    catLower === 'todaydeals' ||
    queryLower === 'deals' || 
    queryLower === "today's deals" || 
    queryLower === 'today deals' || 
    queryLower === 'todays deals' || 
    queryLower === 'flash deals' || 
    queryLower === 'flash sale';

  const isNewArrivalsTarget = 
    catLower === 'new' || 
    catLower === 'new-arrivals' || 
    catLower === 'newarrivals' || 
    catLower === 'arrivals' ||
    queryLower === 'new' || 
    queryLower === 'new arrivals' || 
    queryLower === 'new arrival' || 
    queryLower === 'fresh drops' || 
    queryLower === 'latest arrivals' || 
    queryLower === 'new launches';

  const isFashionArea = !isDealsTarget && !isNewArrivalsTarget && (
    ['fashion', 'mens', 'womens', 'kids-fashion', 'clothing', 'apparel', 'traditional', 'traditional-wear', 'ethnic', 'ethnic-wear', 'mens-traditional', 'womens-traditional', 'kids-traditional'].includes(catLower) || 
    isMenTarget || isWomenTarget || isKidsTarget || isTraditionalTarget
  );
  const isBeautyArea = !isDealsTarget && !isNewArrivalsTarget && (
    ['beauty', 'skincare', 'makeup', 'haircare', 'fragrance', 'fragrances', 'perfume', 'perfumes', 'bath-body', 'bath', 'bodycare', 'personal-care', 'cosmetics'].includes(catLower) ||
    ['beauty', 'skincare', 'makeup', 'haircare', 'fragrance', 'perfume', 'cosmetics'].includes(queryLower)
  );
  const isHomeArea = !isDealsTarget && !isNewArrivalsTarget && !isBeautyArea && !isFashionArea && (
    ['home', 'kitchen', 'furniture', 'bedding', 'decor', 'home-decor', 'lighting', 'storage', 'cookware', 'appliances', 'home-kitchen'].includes(catLower)
  );
  const isToyArea = !isDealsTarget && !isNewArrivalsTarget && !isBeautyArea && !isFashionArea && !isHomeArea && (
    ['toys', 'lego', 'building-blocks', 'action-figures', 'dolls', 'board-games', 'puzzles', 'educational', 'stem-toys', 'rc-toys', 'remote-control', 'soft-toys', 'baby-toys', 'outdoor-toys', 'arts-crafts', 'games'].includes(catLower)
  );
  const isSportsArea = !isDealsTarget && !isNewArrivalsTarget && !isBeautyArea && !isFashionArea && !isHomeArea && !isToyArea && (
    ['sports', 'cricket', 'badminton', 'fitness', 'football', 'cycling', 'yoga', 'swimming', 'outdoor', 'gym'].includes(catLower) ||
    ['sports', 'cricket', 'badminton', 'football', 'gym equipment', 'yoga mat'].includes(queryLower)
  );

  const [loading, setLoading] = useState(true)

  const [sourceProducts, setSourceProducts] = useState<ProductModel[]>([])

  // Load products from DB
  useEffect(() => {
    // Reset stale filters on category or query change
    setMaxPrice(500000)
    setMinRating(0)
    setSelectedBrands([])
    setMinDiscount(0)
    setActiveQuickFilter(null)
    setDealsDept('all')
    setNewArrivalsDept('all')
    if (catLower === 'skincare' || sub === 'skincare') setBeautyDept('skincare');
    else if (catLower === 'makeup' || sub === 'makeup') setBeautyDept('makeup');
    else if (catLower === 'haircare' || sub === 'haircare') setBeautyDept('haircare');
    else if (['fragrances', 'fragrance', 'perfume', 'perfumes'].includes(catLower) || ['fragrances', 'fragrance', 'perfume'].includes(sub || '')) setBeautyDept('fragrance');
    else if (['bath-body', 'bath', 'bodycare'].includes(catLower) || ['bath-body', 'bath', 'bodycare'].includes(sub || '')) setBeautyDept('bath');
    else setBeautyDept('all');

    if (catLower === 'kitchen' || catLower === 'appliances') setHomeDept('kitchen-appliances');
    else if (catLower === 'cookware') setHomeDept('cookware');
    else if (catLower === 'furniture') setHomeDept('furniture');
    else if (catLower === 'bedding') setHomeDept('bedding');
    else if (catLower === 'lighting') setHomeDept('lighting');
    else if (['decor', 'home-decor'].includes(catLower)) setHomeDept('home-decor');
    else if (catLower === 'storage') setHomeDept('storage');
    else setHomeDept('all');

    if (['lego', 'building-blocks'].includes(catLower)) setToyDept('building-blocks');
    else if (['action-figures', 'dolls'].includes(catLower)) setToyDept('action-figures');
    else if (['board-games', 'puzzles'].includes(catLower)) setToyDept('board-games');
    else if (['educational', 'stem-toys'].includes(catLower)) setToyDept('educational');
    else if (['rc-toys', 'remote-control'].includes(catLower)) setToyDept('rc-toys');
    else if (['soft-toys', 'baby-toys'].includes(catLower)) setToyDept('soft-toys');
    else if (['outdoor-toys'].includes(catLower)) setToyDept('outdoor-toys');
    else if (['arts-crafts'].includes(catLower)) setToyDept('arts-crafts');
    else setToyDept('all');

    if (['cricket'].includes(catLower) || subLower === 'cricket') setSportsDept('cricket');
    else if (['badminton'].includes(catLower) || subLower === 'badminton') setSportsDept('badminton');
    else if (['fitness', 'gym'].includes(catLower) || ['fitness', 'gym'].includes(subLower)) setSportsDept('fitness');
    else if (['football', 'soccer'].includes(catLower) || subLower === 'football') setSportsDept('football');
    else if (['cycling', 'bicycle', 'bike'].includes(catLower) || subLower === 'cycling') setSportsDept('cycling');
    else if (['yoga', 'pilates'].includes(catLower) || subLower === 'yoga') setSportsDept('yoga');
    else if (['swimming', 'swim'].includes(catLower) || subLower === 'swimming') setSportsDept('swimming');
    else if (['outdoor', 'adventure', 'camping'].includes(catLower) || subLower === 'outdoor') setSportsDept('outdoor');
    else setSportsDept('all');

    if (['punjab'].includes(subLower) || queryLower.includes('punjab')) setTraditionalState('punjab');
    else if (['south', 'kerala', 'tamil', 'kanchipuram'].includes(subLower) || queryLower.includes('south india') || queryLower.includes('kanchipuram')) setTraditionalState('south');
    else if (['rajasthan', 'gujarat', 'jodhpur', 'bandhani'].includes(subLower) || queryLower.includes('rajasthan') || queryLower.includes('gujarat')) setTraditionalState('rajasthan');
    else if (['bengal', 'jamdani'].includes(subLower) || queryLower.includes('bengal') || queryLower.includes('dhakai')) setTraditionalState('bengal');
    else setTraditionalState('all');

    if (isMenTarget) setTraditionalDept('men');
    else if (isWomenTarget) setTraditionalDept('women');
    else if (isKidsTarget) setTraditionalDept('kids');
    else setTraditionalDept('all');

    let isCurrent = true
    setLoading(true)

    async function loadData() {
      try {
        let data: ProductModel[] = []
        let categoryId: string | undefined = undefined;
        let requestedCategoryFound = false;
        
        // Resolve slug to category ID if cat is present
        if (cat) {
          const categories = await getCategories();
          const cleanCat = cat.toLowerCase().trim();
          
          // 1. Direct match by slug
          let category = categories.find(c => c.slug.toLowerCase() === cleanCat);
          
          // 2. Alias / Subcategory mapping match
          if (!category) {
            const mappedSlug = CATEGORY_ALIAS_MAP[cleanCat];
            if (mappedSlug) {
              category = categories.find(c => c.slug.toLowerCase() === mappedSlug);
            }
          }

          if (category) {
            categoryId = category.id;
            requestedCategoryFound = true;
          }

          // Supplemental-only categories: Toys & Games have no Supabase row.
          // Resolve them directly from the constant if the alias maps to 'toys'.
          if (!requestedCategoryFound && CATEGORY_ALIAS_MAP[cleanCat] === 'toys') {
            categoryId = TOYS_CATEGORY_ID;
            requestedCategoryFound = true;
          }
        }
        
        // Handle Deals & New Arrivals categories
        if (isDealsTarget) {
          data = await getDealsProducts({ minDiscount: 20 });
        } else if (isNewArrivalsTarget) {
          // EXCLUSIVELY new products created specifically for New Arrivals
          data = await getNewArrivalsProducts();
        } else if (cat && !requestedCategoryFound) {
          // CRITICAL GUARD: If cat was specified in URL, but does NOT match any category:
          data = [];
        } else if (query && !isMenTarget && !isWomenTarget && !isKidsTarget && !isTraditionalTarget) {
          // General text search
          data = await searchProducts(query, categoryId);
        } else {
          // Category / department view
          let genderOption: 'men' | 'women' | 'kids' | undefined = undefined;
          if (isMenTarget) genderOption = 'men';
          else if (isWomenTarget) genderOption = 'women';
          else if (isKidsTarget) genderOption = 'kids';

          data = await getProducts({ categoryId, gender: genderOption });

          // If there is an actual product query that wasn't just the gender/traditional keyword itself
          const isPureSpecialQuery = ['men', 'mens', "men's", 'women', 'womens', "women's", 'kids', 'traditional', 'traditional wear', 'ethnic', 'ethnic wear'].includes(queryLower);
          if (query && !isPureSpecialQuery) {
            const q = queryLower;
            data = data.filter(p => 
              p.name.toLowerCase().includes(q) || 
              p.brand.toLowerCase().includes(q) || 
              p.description.toLowerCase().includes(q) ||
              (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
              (p.specs && p.specs['State / Region'] && p.specs['State / Region'].toLowerCase().includes(q))
            );
          }
        }

        // Traditional wear filtering:
        if (isTraditionalTarget) {
          data = data.filter(p => p.subcategory === 'traditional' || p.subcategory === 'ethnic' || Boolean(p.specs && p.specs['State / Region']));
        }

        // STRICT INVARIANT ENFORCEMENT:
        if (isMenTarget) {
          data = data.filter(isMenProduct);
        } else if (isWomenTarget) {
          data = data.filter(isWomenProduct);
        } else if (isKidsTarget) {
          data = data.filter(isKidsProduct);
        }

        if (isCurrent) {
          setSourceProducts(data)
          setLoading(false)
        }
      } catch (err) {
        if (isCurrent) {
          console.error('Error loading products in SearchPage:', err)
          setLoading(false)
        }
      }
    }
    loadData()

    return () => {
      isCurrent = false
    }
  }, [cat, query, sub, gender])

  const allBrands = useMemo(() => [...new Set(sourceProducts.map(p => p.brand))].sort(), [sourceProducts])
  const maxProductPrice = useMemo(() => Math.max(...sourceProducts.map(p => p.original_price), 10000), [sourceProducts])

  const [maxPrice, setMaxPrice] = useState(500000)
  const [minRating, setMinRating] = useState(0)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [minDiscount, setMinDiscount] = useState(0)
  const [sort, setSort] = useState('Popularity')
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)
  const [dealsDept, setDealsDept] = useState<'all' | 'fashion' | 'tech' | 'home' | 'sports' | 'beauty'>('all')
  const [newArrivalsDept, setNewArrivalsDept] = useState<'all' | 'tech' | 'fashion' | 'footwear' | 'watches' | 'home' | 'beauty'>('all')
  const [beautyDept, setBeautyDept] = useState<'all' | 'skincare' | 'makeup' | 'haircare' | 'fragrance' | 'bath'>('all')
  const [homeDept, setHomeDept] = useState<'all' | 'kitchen-appliances' | 'cookware' | 'furniture' | 'bedding' | 'lighting' | 'home-decor' | 'storage'>('all')
  const [toyDept, setToyDept] = useState<'all' | 'building-blocks' | 'action-figures' | 'board-games' | 'educational' | 'rc-toys' | 'soft-toys' | 'outdoor-toys' | 'arts-crafts'>('all')
  const [sportsDept, setSportsDept] = useState<'all' | 'cricket' | 'badminton' | 'fitness' | 'football' | 'cycling' | 'yoga' | 'swimming' | 'outdoor'>('all')
  const [traditionalState, setTraditionalState] = useState<'all' | 'punjab' | 'south' | 'rajasthan' | 'bengal'>('all')
  const [traditionalDept, setTraditionalDept] = useState<'all' | 'men' | 'women' | 'kids'>('all')

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  const toggleBrand = (b: string) =>
    setSelectedBrands((p) => p.includes(b) ? p.filter((x) => x !== b) : [...p, b])

  const clearAll = () => {
    setSelectedBrands([]); setMaxPrice(500000); setMinRating(0); setMinDiscount(0); setActiveQuickFilter(null); setDealsDept('all'); setNewArrivalsDept('all'); setBeautyDept('all'); setHomeDept('all'); setToyDept('all'); setSportsDept('all'); setTraditionalState('all'); setTraditionalDept('all');
    if (isTraditionalTarget) setSearchParams({ cat: 'traditional' })
    if (isBeautyArea) setSearchParams({ cat: 'beauty' })
    if (isHomeArea) setSearchParams({ cat: 'home' })
    if (isToyArea) setSearchParams({ cat: 'toys' })
    if (isSportsArea) setSearchParams({ cat: 'sports' })
  }

  const filtered = useMemo(() => {
    let base = sourceProducts
    if (isDealsTarget && dealsDept !== 'all') {
      if (dealsDept === 'fashion') {
        base = base.filter(p => [FASHION_CATEGORY_ID, FOOTWEAR_CATEGORY_ID, WATCHES_CATEGORY_ID].includes(p.category_id))
      } else if (dealsDept === 'tech') {
        base = base.filter(p => [MOBILES_CATEGORY_ID, LAPTOPS_CATEGORY_ID, ELECTRONICS_CATEGORY_ID].includes(p.category_id))
      } else if (dealsDept === 'home') {
        base = base.filter(p => p.category_id === HOME_CATEGORY_ID)
      } else if (dealsDept === 'sports') {
        base = base.filter(p => p.category_id === SPORTS_CATEGORY_ID)
      } else if (dealsDept === 'beauty') {
        base = base.filter(p => p.category_id === BEAUTY_CATEGORY_ID)
      }
    }
    if (isNewArrivalsTarget && newArrivalsDept !== 'all') {
      if (newArrivalsDept === 'tech') {
        base = base.filter(p => [MOBILES_CATEGORY_ID, LAPTOPS_CATEGORY_ID, ELECTRONICS_CATEGORY_ID].includes(p.category_id))
      } else if (newArrivalsDept === 'fashion') {
        base = base.filter(p => p.category_id === FASHION_CATEGORY_ID)
      } else if (newArrivalsDept === 'footwear') {
        base = base.filter(p => p.category_id === FOOTWEAR_CATEGORY_ID)
      } else if (newArrivalsDept === 'watches') {
        base = base.filter(p => p.category_id === WATCHES_CATEGORY_ID)
      } else if (newArrivalsDept === 'home') {
        base = base.filter(p => p.category_id === HOME_CATEGORY_ID)
      } else if (newArrivalsDept === 'beauty') {
        base = base.filter(p => p.category_id === BEAUTY_CATEGORY_ID)
      }
    }
    if (isTraditionalTarget) {
      if (traditionalDept !== 'all') {
        if (traditionalDept === 'men') base = base.filter(isMenProduct);
        else if (traditionalDept === 'women') base = base.filter(isWomenProduct);
        else if (traditionalDept === 'kids') base = base.filter(isKidsProduct);
      }
      if (traditionalState !== 'all') {
        base = base.filter(p => {
          const region = `${(p.specs && p.specs['State / Region']) || ''} ${p.name} ${p.description}`.toLowerCase();
          if (traditionalState === 'punjab') return region.includes('punjab');
          if (traditionalState === 'south') return region.includes('south') || region.includes('tamil') || region.includes('kerala') || region.includes('kanchipuram');
          if (traditionalState === 'rajasthan') return region.includes('rajasthan') || region.includes('gujarat') || region.includes('jodhpur') || region.includes('bandhani');
          if (traditionalState === 'bengal') return region.includes('bengal') || region.includes('dhakai') || region.includes('jamdani');
          return true;
        });
      }
    }
    if (isBeautyArea && beautyDept !== 'all') {
      const targetSub = beautyDept === 'fragrance' ? 'fragrances' : beautyDept === 'bath' ? 'bath-body' : beautyDept;
      base = base.filter(p => p.subcategory === targetSub);
    }
    if (isHomeArea && homeDept !== 'all') {
      base = base.filter(p => p.subcategory === homeDept);
    }
    if (isToyArea && toyDept !== 'all') {
      base = base.filter(p => p.subcategory === toyDept);
    }
    if (isSportsArea && sportsDept !== 'all') {
      base = base.filter(p => p.subcategory === sportsDept);
    }
    if (activeQuickFilter) {
      const qf = quickFilters.find(q => q.label === activeQuickFilter)
      if (qf) base = base.filter(qf.filter)
    }
    return base
      .filter((p) => p.price <= maxPrice)
      .filter((p) => minRating === 0 || (p.rating ?? 4.5) >= minRating)
      .filter((p) => selectedBrands.length === 0 || selectedBrands.includes(p.brand))
      .filter((p) => p.discount >= minDiscount)
      .sort((a, b) => {
        if (sort === 'Price: Low → High') return a.price - b.price
        if (sort === 'Price: High → Low') return b.price - a.price
        if (sort === 'Customer Rating') return (b.rating ?? 4.5) - (a.rating ?? 4.5)
        if (sort === 'Biggest Discount') return b.discount - a.discount
        if (sort === 'Newest') return b.id.localeCompare(a.id)
        return (b.reviews ?? 100) - (a.reviews ?? 100)
      })
  }, [sourceProducts, maxPrice, minRating, selectedBrands, minDiscount, sort, activeQuickFilter, isDealsTarget, dealsDept, isNewArrivalsTarget, newArrivalsDept, isTraditionalTarget, traditionalDept, traditionalState, isBeautyArea, beautyDept, isHomeArea, homeDept, isToyArea, toyDept, isSportsArea, sportsDept])

  const pageTitle = isDealsTarget
    ? "🔥 Today's Best Deals & Special Discounts"
    : isNewArrivalsTarget
    ? "✨ New Arrivals — Latest Drops & Exclusive Launches"
    : isTraditionalTarget && isMenTarget
    ? "Men's Traditional & Ethnic Wear"
    : isTraditionalTarget && isWomenTarget
    ? "Women's Traditional & Ethnic Wear"
    : isTraditionalTarget && isKidsTarget
    ? "Kids' Traditional & Ethnic Wear"
    : isTraditionalTarget
    ? "🥻 Traditional & Ethnic Indian Wear"
    : isMenTarget
    ? "Men's Fashion & Clothing"
    : isWomenTarget
    ? "Women's Fashion & Clothing"
    : isKidsTarget
    ? "Kids' Fashion & Clothing"
    : isBeautyArea && beautyDept !== 'all'
    ? (beautyDept === 'skincare' ? 'Skincare & Serums' : beautyDept === 'makeup' ? 'Makeup & Cosmetics' : beautyDept === 'haircare' ? 'Haircare & Scalp' : beautyDept === 'fragrance' ? 'Luxury Fragrances' : 'Bath & Body Care')
    : isSportsArea && sportsDept !== 'all'
    ? (sportsDept === 'cricket' ? 'Cricket Equipment & Accessories'
      : sportsDept === 'badminton' ? 'Badminton Rackets & Equipment'
      : sportsDept === 'fitness' ? 'Gym & Home Fitness Equipment'
      : sportsDept === 'football' ? 'Football & Soccer Gear'
      : sportsDept === 'cycling' ? 'Cycling Helmets & Accessories'
      : sportsDept === 'yoga' ? 'Yoga Mats & Recovery Gear'
      : sportsDept === 'swimming' ? 'Swimming Goggles & Swimwear'
      : 'Outdoor, Camping & Hiking Gear')
    : cat
    ? (categoryLabels[cat] || cat)
    : query
    ? `Results for "${query}"`
    : 'All Products'
  const suggestion = query ? didYouMean(query) : null

  // Active filter chips
  const activeFilters: { label: string; clear: () => void }[] = []
  if (isDealsTarget && dealsDept !== 'all') {
    const deptLabels: Record<string, string> = {
      tech: 'Tech & Mobiles Deals',
      fashion: 'Fashion Deals',
      home: 'Home & Kitchen Deals',
      sports: 'Sports & Fitness Deals',
      beauty: 'Beauty Deals',
    }
    activeFilters.push({ label: deptLabels[dealsDept] || dealsDept, clear: () => setDealsDept('all') })
  }
  if (isNewArrivalsTarget && newArrivalsDept !== 'all') {
    const deptLabels: Record<string, string> = {
      tech: 'Tech & Mobiles',
      fashion: 'Fashion Drops',
      footwear: 'Footwear & Sneakers',
      watches: 'Watches & Wearables',
      home: 'Smart Living & Home',
      beauty: 'Beauty Innovations',
    }
    activeFilters.push({ label: `Category: ${deptLabels[newArrivalsDept] || newArrivalsDept}`, clear: () => setNewArrivalsDept('all') })
  }
  if (isTraditionalTarget) {
    if (traditionalDept !== 'all') {
      const dLabels: Record<string, string> = { men: "Category: Men's Traditional", women: "Category: Women's Traditional", kids: "Category: Kids' Traditional" };
      activeFilters.push({ label: dLabels[traditionalDept] || traditionalDept, clear: () => setTraditionalDept('all') });
    }
    if (traditionalState !== 'all') {
      const sLabels: Record<string, string> = { punjab: 'State: Punjab', south: 'State: South India', rajasthan: 'State: Rajasthan & Gujarat', bengal: 'State: Bengal' };
      activeFilters.push({ label: sLabels[traditionalState] || traditionalState, clear: () => setTraditionalState('all') });
    }
  }
  if (isBeautyArea && beautyDept !== 'all') {
    const deptLabels: Record<string, string> = {
      skincare: 'Skincare & Serums',
      makeup: 'Makeup & Cosmetics',
      haircare: 'Haircare & Scalp',
      fragrance: 'Luxury Fragrances',
      bath: 'Bath & Body Care',
    };
    activeFilters.push({ 
      label: `Subcategory: ${deptLabels[beautyDept] || beautyDept}`, 
      clear: () => {
        setBeautyDept('all');
        setSearchParams({ cat: 'beauty' });
      } 
    });
  }
  if (isSportsArea && sportsDept !== 'all') {
    const deptLabels: Record<string, string> = {
      cricket: 'Cricket Equipment',
      badminton: 'Badminton Gear',
      fitness: 'Fitness & Gym',
      football: 'Football & Soccer',
      cycling: 'Cycling Accessories',
      yoga: 'Yoga & Pilates',
      swimming: 'Swimming Gear',
      outdoor: 'Outdoor & Adventure',
    };
    activeFilters.push({ 
      label: `Subcategory: ${deptLabels[sportsDept] || sportsDept}`, 
      clear: () => {
        setSportsDept('all');
        setSearchParams({ cat: 'sports' });
      } 
    });
  }
  if (activeQuickFilter) activeFilters.push({ label: activeQuickFilter, clear: () => setActiveQuickFilter(null) })
  if (selectedBrands.length > 0) selectedBrands.forEach(b => activeFilters.push({ label: b, clear: () => setSelectedBrands(prev => prev.filter(x => x !== b)) }))
  if (minRating > 0) activeFilters.push({ label: `${minRating}★ & above`, clear: () => setMinRating(0) })
  if (minDiscount > 0) activeFilters.push({ label: `${minDiscount}%+ off`, clear: () => setMinDiscount(0) })
  if (maxPrice < maxProductPrice) activeFilters.push({ label: `Under ₹${maxPrice.toLocaleString()}`, clear: () => setMaxPrice(500000) })

  const popularSearches = ['wireless earbuds', 'running shoes', 'kurta set', 'mixer grinder', 'vitamin c serum', 'laptop bag']

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium mb-4 flex-wrap">
          <Link to="/" className="hover:text-[#E40046] transition-colors">Home</Link>
          <ChevronRightIcon size={13} />
          {isDealsTarget ? (
            <span className="text-gray-700 font-semibold">Today's Deals</span>
          ) : isNewArrivalsTarget ? (
            <span className="text-gray-700 font-semibold">New Arrivals</span>
          ) : (
            <>
              {isFashionArea && (
                <>
                  <Link to="/search?cat=fashion" className="hover:text-[#E40046] transition-colors">Fashion</Link>
                  <ChevronRightIcon size={13} />
                </>
              )}
              <span className="text-gray-700 font-semibold">{pageTitle}</span>
            </>
          )}
        </div>

        {/* Deals Hero Banner & Department Filters */}
        {isDealsTarget && (
          <div className="mb-6">
            <div
              className="rounded-2xl p-6 text-white mb-4 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #831843 100%)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  LIMITED TIME FLASH OFFERS
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  🔥 Today's Best Deals & Special Discounts
                </h1>
                <p className="text-gray-300 text-sm mt-1 max-w-xl">
                  Hand-picked blockbuster discounts up to 60%+ off across Electronics, Mobiles, Fashion, Home & Sports. Grab yours before stock runs out!
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-gray-300 font-medium uppercase">Save Up To</p>
                  <p className="text-xl font-extrabold text-amber-400">60% OFF</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-gray-300 font-medium uppercase">Active Deals</p>
                  <p className="text-xl font-extrabold text-white">{sourceProducts.length}+ Items</p>
                </div>
              </div>
            </div>

            {/* Quick Deal Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Department:</span>
              <button
                onClick={() => setDealsDept('all')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  dealsDept === 'all'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔥 All Deals ({sourceProducts.length})
              </button>
              <button
                onClick={() => setDealsDept('tech')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  dealsDept === 'tech'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📱 Mobiles & Tech
              </button>
              <button
                onClick={() => setDealsDept('fashion')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  dealsDept === 'fashion'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👗 Fashion & Lifestyle
              </button>
              <button
                onClick={() => setDealsDept('home')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  dealsDept === 'home'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏠 Home & Kitchen
              </button>
              <button
                onClick={() => setDealsDept('sports')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  dealsDept === 'sports'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏃 Sports & Fitness
              </button>
              <button
                onClick={() => setDealsDept('beauty')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  dealsDept === 'beauty'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💄 Beauty & Grooming
              </button>
            </div>
          </div>
        )}

        {/* New Arrivals Hero Banner & Department Filters */}
        {isNewArrivalsTarget && (
          <div className="mb-6">
            <div
              className="rounded-2xl p-6 text-white mb-4 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-400/20 border border-violet-400/40 text-violet-200 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  2025/2026 FRESH EXCLUSIVE LAUNCHES
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  ✨ New Arrivals — Latest Drops & Exclusive Launches
                </h1>
                <p className="text-gray-300 text-sm mt-1 max-w-xl">
                  Discover brand-new products just added to the store. From next-gen flagship smartphones and audio gear to luxury fashion drops, sneakers, and smart home innovations.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-gray-300 font-medium uppercase">Catalog</p>
                  <p className="text-xl font-extrabold text-emerald-400">100% NEW</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-gray-300 font-medium uppercase">New Releases</p>
                  <p className="text-xl font-extrabold text-white">{sourceProducts.length} Products</p>
                </div>
              </div>
            </div>

            {/* Quick Department Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Department:</span>
              <button
                onClick={() => setNewArrivalsDept('all')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  newArrivalsDept === 'all'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✨ All New Arrivals ({sourceProducts.length})
              </button>
              <button
                onClick={() => setNewArrivalsDept('tech')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  newArrivalsDept === 'tech'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📱 Mobiles & Tech
              </button>
              <button
                onClick={() => setNewArrivalsDept('fashion')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  newArrivalsDept === 'fashion'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👗 Fashion Drops
              </button>
              <button
                onClick={() => setNewArrivalsDept('footwear')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  newArrivalsDept === 'footwear'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👟 Sneakers & Footwear
              </button>
              <button
                onClick={() => setNewArrivalsDept('watches')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  newArrivalsDept === 'watches'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⌚ Watches & Wearables
              </button>
              <button
                onClick={() => setNewArrivalsDept('home')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  newArrivalsDept === 'home'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏠 Smart Living & Home
              </button>
              <button
                onClick={() => setNewArrivalsDept('beauty')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all ${
                  newArrivalsDept === 'beauty'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💄 Beauty Innovations
              </button>
            </div>
          </div>
        )}

        {/* Fashion Department Navigation Tabs */}
        {isFashionArea && (
          <div className="mb-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Department:</span>
              <Link
                to="/search?cat=fashion"
                className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  !isMenTarget && !isWomenTarget && !isKidsTarget && !isTraditionalTarget && catLower === 'fashion'
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✨ All Fashion
              </Link>
              <Link
                to="/search?cat=traditional"
                className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isTraditionalTarget && !isMenTarget && !isWomenTarget && !isKidsTarget
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 text-amber-900 hover:from-amber-100 hover:to-orange-100'
                }`}
              >
                🥻 Traditional Wear
              </Link>
              <Link
                to="/search?cat=mens"
                className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isMenTarget && !isTraditionalTarget
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👔 Men's Clothing
              </Link>
              <Link
                to="/search?cat=womens"
                className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isWomenTarget && !isTraditionalTarget
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👗 Women's Clothing
              </Link>
              <Link
                to="/search?cat=kids-fashion"
                className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isKidsTarget && !isTraditionalTarget
                    ? 'bg-[#E40046] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🧸 Kids' Fashion
              </Link>
              <Link
                to="/search?cat=footwear"
                className="px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                👟 Footwear
              </Link>
              <Link
                to="/search?cat=watches"
                className="px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ⌚ Watches
              </Link>
            </div>
          </div>
        )}

        {/* Traditional & Ethnic Wear Hero Banner & 4 State / Category Filter Tabs */}
        {isTraditionalTarget && (
          <div className="mb-6">
            <div
              className="rounded-2xl p-6 text-white mb-4 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #780206 0%, #b31217 50%, #d4380d 100%)', boxShadow: '0 8px 30px rgba(179,18,23,0.22)' }}
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  AUTHENTIC REGIONAL HANDLOOMS & ROYAL ENSEMBLES
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  🥻 Traditional & Ethnic Wear
                </h1>
                <p className="text-amber-100 text-sm mt-1 max-w-xl leading-relaxed">
                  Celebrate timeless Indian heritage with authentic state traditional attire across <strong>Punjab</strong>, <strong>South India</strong>, <strong>Rajasthan & Gujarat</strong>, and <strong>Bengal</strong> for Men, Women & Kids.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-amber-200 font-medium uppercase">Regions</p>
                  <p className="text-xl font-extrabold text-white">4 States</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-amber-200 font-medium uppercase">Save Up To</p>
                  <p className="text-xl font-extrabold text-amber-300">47% OFF</p>
                </div>
              </div>
            </div>

            {/* Subcategory switcher: Department + 4 Regional States Filter Pills */}
            <div className="space-y-2.5 pb-3 border-b border-gray-100">
              {/* Row 1: Department / Wear Type */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Category:</span>
                <button
                  type="button"
                  onClick={() => setTraditionalDept('all')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalDept === 'all'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✨ All Categories
                </button>
                <button
                  type="button"
                  onClick={() => setTraditionalDept('men')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalDept === 'men'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👔 Men's Traditional Wear
                </button>
                <button
                  type="button"
                  onClick={() => setTraditionalDept('women')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalDept === 'women'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👗 Women's Traditional Wear
                </button>
                <button
                  type="button"
                  onClick={() => setTraditionalDept('kids')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalDept === 'kids'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧸 Kids' Traditional Wear
                </button>
              </div>

              {/* Row 2: 4 Regional States */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">State / Region:</span>
                <button
                  type="button"
                  onClick={() => setTraditionalState('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalState === 'all'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
                  }`}
                >
                  🇮🇳 All 4 States
                </button>
                <button
                  type="button"
                  onClick={() => setTraditionalState('punjab')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalState === 'punjab'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
                  }`}
                >
                  🌾 Punjab (Kurta Pajama, Modi Jacket, Phulkari)
                </button>
                <button
                  type="button"
                  onClick={() => setTraditionalState('south')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalState === 'south'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
                  }`}
                >
                  🛕 South India (Kanchipuram Silk, Zari Dhoti, Pattu Pavada)
                </button>
                <button
                  type="button"
                  onClick={() => setTraditionalState('rajasthan')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalState === 'rajasthan'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
                  }`}
                >
                  🏰 Rajasthan & Gujarat (Bandhani Chaniya, Jodhpuri Bandhgala, Ghagra)
                </button>
                <button
                  type="button"
                  onClick={() => setTraditionalState('bengal')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    traditionalState === 'bengal'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100'
                  }`}
                >
                  🪷 Bengal (Dhakai Jamdani Lal Paar, Tussar Silk Dhoti Panjabi)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Beauty & Personal Care Hero Banner & Subcategory Filter Tabs */}
        {isBeautyArea && (
          <div className="mb-6">
            <div
              className="rounded-2xl p-6 text-white mb-4 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #4a044e 0%, #831843 50%, #be185d 100%)', boxShadow: '0 8px 30px rgba(190,24,93,0.18)' }}
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
                  100% GENUINE & DERMATOLOGIST TESTED
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  ✨ Beauty, Skincare & Luxury Fragrances
                </h1>
                <p className="text-pink-100 text-sm mt-1 max-w-xl">
                  Discover dermatologist-approved skincare serums, iconic makeup essentials, salon-grade haircare, and signature French & European perfumes from world-class luxury houses.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-pink-200 font-medium uppercase">Authenticity</p>
                  <p className="text-xl font-extrabold text-white">100% Sealed</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-pink-200 font-medium uppercase">Save Up To</p>
                  <p className="text-xl font-extrabold text-amber-300">30% OFF</p>
                </div>
              </div>
            </div>

            {/* Subcategory switcher pills */}
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Subcategory:</span>
                <Link
                  to="/search?cat=beauty"
                  onClick={() => setBeautyDept('all')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    beautyDept === 'all'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✨ All Beauty
                </Link>
                <Link
                  to="/search?cat=skincare"
                  onClick={() => setBeautyDept('skincare')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    beautyDept === 'skincare'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧴 Skincare & Serums
                </Link>
                <Link
                  to="/search?cat=makeup"
                  onClick={() => setBeautyDept('makeup')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    beautyDept === 'makeup'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💄 Makeup & Cosmetics
                </Link>
                <Link
                  to="/search?cat=haircare"
                  onClick={() => setBeautyDept('haircare')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    beautyDept === 'haircare'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💇 Haircare & Scalp
                </Link>
                <Link
                  to="/search?cat=fragrances"
                  onClick={() => setBeautyDept('fragrance')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    beautyDept === 'fragrance'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌸 Luxury Fragrances
                </Link>
                <Link
                  to="/search?cat=bath-body"
                  onClick={() => setBeautyDept('bath')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    beautyDept === 'bath'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🛁 Bath & Body Care
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Home & Kitchen Hero Banner & Subcategory Filter Tabs */}
        {isHomeArea && (
          <div className="mb-6">
            <div
              className="rounded-2xl p-6 text-white mb-4 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #1a3a1a 0%, #166534 50%, #15803d 100%)', boxShadow: '0 8px 30px rgba(22,101,52,0.18)' }}
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-200 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  PREMIUM BRANDS · FREE DELIVERY ON FURNITURE
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  🏠 Home & Kitchen Essentials
                </h1>
                <p className="text-green-100 text-sm mt-1 max-w-xl">
                  Discover premium cookware, stylish furniture, smart lighting, cosy bedding, and must-have kitchen appliances from India's top brands—curated for modern homes.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-green-200 font-medium uppercase">Save Up To</p>
                  <p className="text-xl font-extrabold text-amber-300">56% OFF</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-green-200 font-medium uppercase">Products</p>
                  <p className="text-xl font-extrabold text-white">26+</p>
                </div>
              </div>
            </div>

            {/* Subcategory switcher pills */}
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Category:</span>
                <Link
                  to="/search?cat=home"
                  onClick={() => setHomeDept('all')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'all'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏠 All Home & Kitchen
                </Link>
                <Link
                  to="/search?cat=kitchen"
                  onClick={() => setHomeDept('kitchen-appliances')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'kitchen-appliances'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🍳 Kitchen Appliances
                </Link>
                <Link
                  to="/search?cat=cookware"
                  onClick={() => setHomeDept('cookware')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'cookware'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🥘 Cookware & Kitchenware
                </Link>
                <Link
                  to="/search?cat=furniture"
                  onClick={() => setHomeDept('furniture')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'furniture'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🛋️ Furniture
                </Link>
                <Link
                  to="/search?cat=bedding"
                  onClick={() => setHomeDept('bedding')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'bedding'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🛏️ Bedding & Bath
                </Link>
                <Link
                  to="/search?cat=lighting"
                  onClick={() => setHomeDept('lighting')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'lighting'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💡 Lighting
                </Link>
                <Link
                  to="/search?cat=decor"
                  onClick={() => setHomeDept('home-decor')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'home-decor'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🪴 Home Décor
                </Link>
                <Link
                  to="/search?cat=storage"
                  onClick={() => setHomeDept('storage')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    homeDept === 'storage'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📦 Storage & Organization
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Toys & Games Hero Banner & Subcategory Filter Tabs */}
        {isToyArea && (
          <div className="mb-6">
            <div
              className="rounded-2xl p-6 text-white mb-4 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)', boxShadow: '0 8px 30px rgba(124,58,237,0.2)' }}
            >
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                  100% GENUINE · SAFE & CERTIFIED FOR KIDS
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  🧸 Toys, Games & Learning
                </h1>
                <p className="text-violet-100 text-sm mt-1 max-w-xl">
                  Discover LEGO sets, board games, STEM kits, RC vehicles, cuddly soft toys, outdoor fun, and creative arts — all the best toys from top brands for kids of all ages.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-violet-200 font-medium uppercase">Save Up To</p>
                  <p className="text-xl font-extrabold text-amber-300">50% OFF</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-violet-200 font-medium uppercase">Products</p>
                  <p className="text-xl font-extrabold text-white">28+</p>
                </div>
              </div>
            </div>

            {/* Subcategory switcher pills */}
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Category:</span>
                <Link
                  to="/search?cat=toys"
                  onClick={() => setToyDept('all')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'all'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧸 All Toys & Games
                </Link>
                <Link
                  to="/search?cat=lego"
                  onClick={() => setToyDept('building-blocks')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'building-blocks'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧱 LEGO & Building Blocks
                </Link>
                <Link
                  to="/search?cat=action-figures"
                  onClick={() => setToyDept('action-figures')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'action-figures'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🦸 Action Figures & Dolls
                </Link>
                <Link
                  to="/search?cat=board-games"
                  onClick={() => setToyDept('board-games')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'board-games'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎲 Board Games & Puzzles
                </Link>
                <Link
                  to="/search?cat=educational"
                  onClick={() => setToyDept('educational')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'educational'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔬 Educational & STEM
                </Link>
                <Link
                  to="/search?cat=rc-toys"
                  onClick={() => setToyDept('rc-toys')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'rc-toys'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🚁 RC & Drones
                </Link>
                <Link
                  to="/search?cat=soft-toys"
                  onClick={() => setToyDept('soft-toys')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'soft-toys'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🐻 Soft Toys & Baby
                </Link>
                <Link
                  to="/search?cat=outdoor-toys"
                  onClick={() => setToyDept('outdoor-toys')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'outdoor-toys'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🛴 Outdoor & Sports
                </Link>
                <Link
                  to="/search?cat=arts-crafts"
                  onClick={() => setToyDept('arts-crafts')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    toyDept === 'arts-crafts'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎨 Arts & Crafts
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sports & Fitness Hero Banner */}
        {isSportsArea && (
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 p-6 md:p-8 text-white shadow-lg mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-emerald-100 uppercase tracking-wider mb-2">
                  🏆 Pro-Grade Sports & Fitness Arena
                </span>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                  {sportsDept === 'all'
                    ? 'Sports, Fitness & Outdoor Gear'
                    : sportsDept === 'cricket'
                    ? 'Cricket Equipment & Accessories'
                    : sportsDept === 'badminton'
                    ? 'Badminton Rackets & Equipment'
                    : sportsDept === 'fitness'
                    ? 'Gym & Home Fitness Equipment'
                    : sportsDept === 'football'
                    ? 'Football & Soccer Gear'
                    : sportsDept === 'cycling'
                    ? 'Cycling Helmets & Accessories'
                    : sportsDept === 'yoga'
                    ? 'Yoga Mats & Recovery Gear'
                    : sportsDept === 'swimming'
                    ? 'Swimming Goggles & Swimwear'
                    : 'Outdoor, Camping & Hiking Gear'}
                </h1>
                <p className="text-emerald-100 text-sm leading-relaxed">
                  Gear up for peak performance with certified equipment from SG, SS, Yonex, Li-Ning, Nivia, Adidas, Boldfit, and Decathlon.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-emerald-200 font-medium uppercase">Save Up To</p>
                  <p className="text-xl font-extrabold text-amber-300">58% OFF</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-[11px] text-emerald-200 font-medium uppercase">Products</p>
                  <p className="text-xl font-extrabold text-white">28+</p>
                </div>
              </div>
            </div>

            {/* Subcategory switcher pills */}
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mr-1 shrink-0">Category:</span>
                <Link
                  to="/search?cat=sports"
                  onClick={() => setSportsDept('all')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'all'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏅 All Sports
                </Link>
                <Link
                  to="/search?cat=cricket"
                  onClick={() => setSportsDept('cricket')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'cricket'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏏 Cricket
                </Link>
                <Link
                  to="/search?cat=badminton"
                  onClick={() => setSportsDept('badminton')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'badminton'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏸 Badminton
                </Link>
                <Link
                  to="/search?cat=fitness"
                  onClick={() => setSportsDept('fitness')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'fitness'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏋️ Fitness & Gym
                </Link>
                <Link
                  to="/search?cat=football"
                  onClick={() => setSportsDept('football')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'football'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⚽ Football
                </Link>
                <Link
                  to="/search?cat=cycling"
                  onClick={() => setSportsDept('cycling')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'cycling'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🚴 Cycling
                </Link>
                <Link
                  to="/search?cat=yoga"
                  onClick={() => setSportsDept('yoga')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'yoga'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧘 Yoga & Wellness
                </Link>
                <Link
                  to="/search?cat=swimming"
                  onClick={() => setSportsDept('swimming')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'swimming'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🏊 Swimming
                </Link>
                <Link
                  to="/search?cat=outdoor"
                  onClick={() => setSportsDept('outdoor')}
                  className={`px-4 py-1.5 rounded-xl text-[13px] font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    sportsDept === 'outdoor'
                      ? 'bg-[#E40046] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧗 Outdoor & Hiking
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Category title */}
        {!isDealsTarget && !isNewArrivalsTarget && !isBeautyArea && !isHomeArea && !isToyArea && !isSportsArea && (cat || query) && (
          <div className="mb-4">
            <h1 className="text-[22px] font-extrabold text-gray-900">{pageTitle}</h1>
            {!loading && <p className="text-[13px] text-gray-500 mt-0.5">{filtered.length} products found</p>}
          </div>
        )}

        {/* Typo suggestion */}
        {query && suggestion && suggestion !== query && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-[13px] font-medium text-gray-600 flex items-center gap-2"
            style={{ backgroundColor: '#fff9fa', border: '1px solid #fce7f3' }}>
            <span className="text-[#E40046]">💡</span>
            Did you mean: <Link to={`/search?q=${encodeURIComponent(suggestion)}`}
              className="font-bold text-[#E40046] hover:underline ml-1">{suggestion}</Link>?
          </div>
        )}

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {quickFilters.map(qf => (
            <button key={qf.label} onClick={() => setActiveQuickFilter(prev => prev === qf.label ? null : qf.label)}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all border"
              style={{
                backgroundColor: activeQuickFilter === qf.label ? '#E40046' : '#fff',
                color: activeQuickFilter === qf.label ? '#fff' : '#4b5563',
                borderColor: activeQuickFilter === qf.label ? '#E40046' : '#e5e7eb',
              }}>
              {qf.label}
            </button>
          ))}
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[12px] font-semibold text-gray-500">Active:</span>
            {activeFilters.map(f => (
              <button key={f.label} onClick={f.clear}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold transition-all"
                style={{ backgroundColor: '#fff5f7', color: '#E40046', border: '1px solid #fce7f3' }}>
                {f.label} <span className="text-[14px] leading-none">×</span>
              </button>
            ))}
            <button onClick={clearAll} className="text-[12px] font-semibold text-gray-400 hover:text-[#E40046] transition-colors">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Filter Sidebar ── */}
          <aside className="w-60 shrink-0 hidden lg:block">
            <div className="sticky top-[84px] space-y-4">
              <FilterBox title="Price Range">
                <RangeSlider min={0} max={maxProductPrice} value={Math.min(maxPrice, maxProductPrice)} onChange={setMaxPrice} />
              </FilterBox>

              <FilterBox title="Brand">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allBrands.map((b) => (
                    <label key={b} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)}
                        className="w-4 h-4 accent-[#E40046] rounded" />
                      <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#E40046] transition-colors">{b}</span>
                    </label>
                  ))}
                </div>
              </FilterBox>

              <FilterBox title="Customer Rating">
                {[4, 3, 2].map((r) => (
                  <button key={r} onClick={() => setMinRating(minRating === r ? 0 : r)}
                    className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl transition-all"
                    style={{ backgroundColor: minRating === r ? '#fff5f7' : 'transparent' }}>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} size={13} fill={i < r ? '#FBBF24' : 'none'} stroke={i < r ? '#FBBF24' : '#ddd'} />
                      ))}
                    </div>
                    <span className="text-[12px] font-medium text-gray-600">& Above</span>
                  </button>
                ))}
              </FilterBox>

              <FilterBox title="Discount">
                {[10, 20, 30, 50, 70].map((d) => (
                  <button key={d} onClick={() => setMinDiscount(minDiscount === d ? 0 : d)}
                    className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl text-left transition-all"
                    style={{ backgroundColor: minDiscount === d ? '#fff5f7' : 'transparent' }}>
                    <span className="text-[13px] font-medium text-gray-600">{d}% or more</span>
                  </button>
                ))}
              </FilterBox>

              <FilterBox title="Delivery">
                {['Today', 'Tomorrow', 'Within 2 days'].map((d) => (
                  <label key={d} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#E40046]" />
                    <span className="text-[13px] font-medium text-gray-700">{d}</span>
                  </label>
                ))}
              </FilterBox>

              {activeFilters.length > 0 && (
                <button onClick={clearAll}
                  className="w-full py-2.5 rounded-xl text-[13px] font-bold border-2 transition-all hover:bg-[#E40046] hover:text-white hover:border-[#E40046]"
                  style={{ borderColor: '#E40046', color: '#E40046' }}>
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-[14px] font-semibold text-gray-600">
                {loading ? 'Loading products…' : (
                  <>Showing <span className="text-gray-900 font-bold">{filtered.length}</span> results
                    {isDealsTarget ? (
                      <> in <span className="font-bold" style={{ color: '#E40046' }}>Today's Best Deals</span></>
                    ) : isNewArrivalsTarget ? (
                      <> in <span className="font-bold" style={{ color: '#E40046' }}>New Arrivals</span></>
                    ) : (
                      <>
                        {cat && <> in <span className="font-bold" style={{ color: '#E40046' }}>{pageTitle}</span></>}
                        {query && <> for <span className="font-bold" style={{ color: '#E40046' }}>"{query}"</span></>}
                      </>
                    )}
                  </>
                )}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  {(['grid', 'list'] as const).map((v) => (
                    <button key={v} onClick={() => setView(v)}
                      className="px-3 py-1.5 text-[12px] font-semibold transition-all"
                      style={{ backgroundColor: view === v ? '#E40046' : '#fff', color: view === v ? '#fff' : '#666' }}>
                      {v === 'grid' ? '⊞ Grid' : '☰ List'}
                    </button>
                  ))}
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-2 rounded-xl text-[13px] font-semibold border border-gray-200 outline-none bg-white text-gray-700 cursor-pointer">
                  {sortOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading && <SkeletonRow count={8} />}

            {/* Products */}
            {!loading && filtered.length > 0 && (
              <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-4'}>
                {filtered.map((p) => (
                  view === 'grid'
                    ? <GridCard key={p.id} product={p} wishlisted={isInWishlist(p.id)} onWishlist={() => toggleWishlist(p.id)} />
                    : <ListCard key={p.id} product={p} wishlisted={isInWishlist(p.id)} onWishlist={() => toggleWishlist(p.id)} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h2 className="text-[20px] font-bold text-gray-800 mb-2">
                  We couldn't find exactly what you're looking for
                </h2>
                <p className="text-[14px] text-gray-400 mb-6">
                  {activeFilters.length > 0 ? 'Try adjusting or clearing your filters.' : 'Try a different search term.'}
                </p>
                {activeFilters.length > 0 && (
                  <button onClick={clearAll}
                    className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white mb-8"
                    style={{ backgroundColor: '#E40046' }}>
                    Clear All Filters
                  </button>
                )}
                <div className="text-left max-w-sm mx-auto">
                  <p className="text-[13px] font-bold text-gray-600 mb-3">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map(s => (
                      <Link key={s} to={`/search?q=${encodeURIComponent(s)}`}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium text-gray-600 hover:text-[#E40046] hover:border-[#E40046] transition-all"
                        style={{ border: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

import React from 'react'
