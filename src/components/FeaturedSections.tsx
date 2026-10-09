import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './Icons'
import ProductCard from './ProductCard'
import PersonalizedRecommendations from './PersonalizedRecommendations'
import { getProducts, getNewArrivalsProducts, ProductModel } from '../services/products'
import type { Product } from './ProductCard'

interface SectionProps {
  title: string
  subtitle?: string
  products: Product[]
  accent?: boolean
  linkTo?: string
}

function Section({ title, subtitle, products, accent, linkTo = '/search' }: SectionProps) {
  if (products.length === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {accent && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-[#E40046]">
                Hot
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <Link
          to={linkTo}
          className="text-xs font-semibold text-[#E40046] hover:underline flex items-center gap-1"
        >
          View All <ChevronRightIcon size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

function mapToProduct(p: ProductModel, badge?: string): Product {
  const images = p.images && p.images.length > 0
    ? p.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format']

  return {
    id: p.id,
    title: p.name,
    brand: p.brand,
    price: p.price,
    originalPrice: p.original_price,
    discount: p.discount,
    rating: p.rating || 4.5,
    reviews: p.reviews || 120,
    image: images[0],
    badge,
    delivery: p.delivery || 'Tomorrow',
    stock: p.stock_quantity || 10,
    cod: true,
  }
}

export default function FeaturedSections() {
  const [trending, setTrending] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])

  useEffect(() => {
    async function loadFeatured() {
      const [all, newProds] = await Promise.all([
        getProducts(),
        getNewArrivalsProducts({ limit: 6 })
      ])
      if (all && all.length > 0) {
        // Trending deals (highest discount)
        const sortedByDiscount = [...all].sort((a, b) => (b.discount || 0) - (a.discount || 0))
        setTrending(sortedByDiscount.slice(0, 6).map(p => mapToProduct(p, 'Hot Deal')))

        // Best sellers (mix of top categories)
        setBestSellers(all.slice(6, 12).map(p => mapToProduct(p, 'Best Seller')))
      }
      if (newProds && newProds.length > 0) {
        // New arrivals exclusively from brand-new catalog
        setNewArrivals(newProds.map(p => mapToProduct(p, 'New')))
      }
    }
    loadFeatured()
  }, [])

  return (
    <>
      <Section
        title="Trending Deals"
        subtitle="What everyone's buying right now"
        products={trending}
        linkTo="/search?cat=deals"
      />
      <PersonalizedRecommendations />
      <Section
        title="Best Sellers"
        subtitle="Top rated by millions of shoppers"
        products={bestSellers}
        linkTo="/search?q=best"
      />
      <Section
        title="New Arrivals"
        subtitle="Fresh drops just for you"
        products={newArrivals}
        linkTo="/search?cat=new"
      />
    </>
  )
}
