import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon, SparklesIcon } from './Icons'
import type { Product } from './ProductCard'
import ProductCard from './ProductCard'
import { getProducts, ProductModel } from '../services/products'

// Simulated user signals
const userProfile = {
  name: 'Shopper',
  recentSearches: ['bluetooth earphones under 1000', 'fashion jeans', 'face serum vitamin c'],
  browsedCategories: ['Electronics', 'Fashion', 'Beauty'],
  location: 'Bengaluru',
}

const signals = [
  { label: '🔍 Your searches', key: 'search' },
  { label: '📱 Social trending', key: 'social' },
  { label: '👁️ Recently viewed', key: 'browsed' },
  { label: '📣 Top picks for you', key: 'ads' },
]

function mapToProduct(p: ProductModel, badge?: string): Product {
  return {
    id: p.id,
    title: p.name,
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format',
    rating: 4.6,
    reviews: 1480,
    price: Number(p.price) || 0,
    originalPrice: Number(p.original_price) || Number(p.price) || 0,
    discount: p.discount || 0,
    badge,
    brand: p.brand,
    delivery: 'Tomorrow',
    cod: true,
    stock: p.stock_quantity || 10
  }
}

export default function PersonalizedRecommendations() {
  const [activeSignal, setActiveSignal] = useState('search')
  const [signalProducts, setSignalProducts] = useState<Record<string, { reason: string; products: Product[] }>>({
    search: {
      reason: 'Based on your searches for "wireless audio" & "top deals"',
      products: [],
    },
    social: {
      reason: 'Trending in Bengaluru on social channels right now',
      products: [],
    },
    browsed: {
      reason: 'Picked because you browsed Electronics, Laptops & Fashion',
      products: [],
    },
    ads: {
      reason: 'Curated premium picks matched to your preferences',
      products: [],
    },
  })

  useEffect(() => {
    async function loadRecs() {
      const all = await getProducts()
      if (all && all.length > 0) {
        setSignalProducts({
          search: {
            reason: 'Based on your searches for "wireless audio" & "top deals"',
            products: all.slice(0, 6).map(p => mapToProduct(p, 'For You')),
          },
          social: {
            reason: 'Trending in Bengaluru on social channels right now',
            products: all.slice(6, 12).map(p => mapToProduct(p, 'Trending')),
          },
          browsed: {
            reason: 'Picked because you browsed Electronics, Laptops & Fashion',
            products: all.slice(12, 18).map(p => mapToProduct(p, 'Browsed')),
          },
          ads: {
            reason: 'Curated premium picks matched to your preferences',
            products: all.slice(18, 24).map(p => mapToProduct(p, 'Featured')),
          },
        })
      }
    }
    loadRecs()
  }, [])

  const current = signalProducts[activeSignal] || signalProducts.search

  return (
    <div className="mb-10">
      {/* Header */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: 'linear-gradient(135deg, #fff0f4 0%, #fdf4ff 100%)', border: '1px solid #fce7f3' }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #E40046 0%, #b0003a 100%)' }}
            >
              <SparklesIcon size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#E40046' }}>
                Recommended For You 👋
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {current.reason}
              </p>
            </div>
          </div>
          <Link to="/search?q=recommended" className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: '#E40046' }}>
            See All <ChevronRightIcon size={15} />
          </Link>
        </div>

        {/* Signal tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {signals.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSignal(s.key)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeSignal === s.key ? '#E40046' : '#fff',
                color: activeSignal === s.key ? '#fff' : '#555',
                border: `1px solid ${activeSignal === s.key ? '#E40046' : '#e5e5e5'}`,
                boxShadow: activeSignal === s.key ? '0 4px 12px rgba(228,0,70,0.25)' : 'none',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* User signals summary */}
        <div className="flex flex-wrap gap-2 mt-3">
          {userProfile.recentSearches.map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-full text-[11px] font-medium text-gray-500"
              style={{ backgroundColor: '#f5f5f5', border: '1px solid #eee' }}
            >
              🔍 {s}
            </span>
          ))}
          {userProfile.browsedCategories.map((c) => (
            <span
              key={c}
              className="px-3 py-1 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: '#fff0f4', color: '#E40046', border: '1px solid #fce7f3' }}
            >
              👁️ {c}
            </span>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {current.products.map((p) => (
          <ProductCard key={p.id} product={p} compact />
        ))}
      </div>
    </div>
  )
}
