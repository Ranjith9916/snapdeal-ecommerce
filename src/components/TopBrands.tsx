import { Link } from 'react-router-dom'

const brands = [
  { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=120&fit=crop&auto=format', offer: 'Up to 40% off' },
  { name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=120&fit=crop&auto=format', offer: 'Up to 50% off' },
  { name: 'Apple', logo: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=120&fit=crop&auto=format', offer: 'Up to 30% off' },
  { name: 'Lakme', logo: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&h=120&fit=crop&auto=format', offer: 'Up to 55% off' },
  { name: "Levi's", logo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=120&fit=crop&auto=format', offer: 'Up to 60% off' },
  { name: 'Sony', logo: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=120&fit=crop&auto=format', offer: 'Up to 35% off' },
]

export default function TopBrands() {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Top Brands</h2>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">Shop from your favorite brands</p>
        </div>
        <Link to="/search" className="text-sm font-semibold hover:underline" style={{ color: '#E40046' }}>
          View All Brands →
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            to={`/search?q=${encodeURIComponent(brand.name)}`}
            className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 block"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="w-full h-28 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
              <p className="text-white font-bold text-sm">{brand.name}</p>
              <p
                className="text-[10px] font-semibold mt-0.5"
                style={{ color: '#ff8fab' }}
              >
                {brand.offer}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
