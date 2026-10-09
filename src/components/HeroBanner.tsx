import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

const slides = [
  {
    id: 1,
    badge: 'MEGA FASHION SALE',
    headline: 'Style Without\nCompromise',
    subtitle: 'Up to 70% off on top fashion brands. Free shipping on all orders above ₹499.',
    cta: 'Shop Fashion',
    ctaLink: '/search?cat=fashion',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 60%, #E40046 100%)',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=420&fit=crop&auto=format',
    tag: 'UP TO 70% OFF',
    accent: '#E40046',
  },
  {
    id: 2,
    badge: 'TECH WEEK DEALS',
    headline: 'Power Your\nDigital Life',
    subtitle: 'Smartphones, laptops & gadgets at unbeatable prices. EMI starting ₹0.',
    cta: 'Explore Electronics',
    ctaLink: '/search?cat=electronics',
    bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a2744 50%, #0d47a1 100%)',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=420&fit=crop&auto=format',
    tag: 'EMI ₹0',
    accent: '#3b82f6',
  },
  {
    id: 3,
    badge: 'HOME MAKEOVER',
    headline: 'Transform Your\nLiving Space',
    subtitle: 'Premium furniture, kitchen essentials & home décor at 50% off.',
    cta: 'Shop Home',
    ctaLink: '/search?cat=home',
    bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=420&fit=crop&auto=format',
    tag: '50% OFF',
    accent: '#10b981',
  },
]

const offerCards = [
  {
    label: 'Mobiles',
    badge: 'Up to 40% off',
    img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=120&h=120&fit=crop&auto=format',
    to: '/search?cat=mobiles',
    bg: '#f0f9ff',
    accent: '#3b82f6',
  },
  {
    label: 'Beauty',
    badge: 'Min 30% off',
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&h=120&fit=crop&auto=format',
    to: '/search?cat=beauty',
    bg: '#fff5f7',
    accent: '#E40046',
  },
  {
    label: 'Sports',
    badge: 'New Arrivals',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop&auto=format',
    to: '/search?cat=sports',
    bg: '#f0fff4',
    accent: '#22c55e',
  },
  {
    label: 'Electronics',
    badge: 'Flash Deals',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop&auto=format',
    to: '/search?cat=electronics',
    bg: '#fdf4ff',
    accent: '#8b5cf6',
  },
]

export default function HeroBanner() {
  const [active, setActive] = useState(0)
  const slide = slides[active]

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((a) => (a + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mt-4 mb-6">
      <div className="flex gap-3">
        {/* Main Carousel */}
        <div className="flex-1 relative overflow-hidden" style={{ borderRadius: 18, minHeight: 360 }}>
          {/* Background */}
          <div className="absolute inset-0 transition-all duration-700" style={{ background: slide.bg }} />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between h-full min-h-[360px] px-10 py-8">
            <div style={{ maxWidth: 380 }}>
              <span
                className="inline-block px-3 py-1 text-[10px] font-extrabold rounded-full mb-4 tracking-widest uppercase"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)' }}
              >
                {slide.badge}
              </span>
              <h1 className="text-[36px] font-extrabold text-white leading-tight mb-3 whitespace-pre-line"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {slide.headline}
              </h1>
              <p className="text-white/70 text-[14px] font-medium mb-7 leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex items-center gap-3">
                <Link to={slide.ctaLink}>
                  <button
                    className="px-7 py-3 rounded-xl text-white font-bold text-[14px] hover:scale-105 transition-all"
                    style={{ backgroundColor: slide.accent, boxShadow: `0 8px 20px ${slide.accent}50` }}
                  >
                    {slide.cta} →
                  </button>
                </Link>
                <div className="px-4 py-2.5 rounded-xl text-[13px] font-extrabold text-white"
                  style={{ border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}>
                  {slide.tag}
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src={slide.img}
                alt={slide.headline}
                className="object-cover rounded-2xl shadow-2xl"
                style={{ width: 380, height: 280 }}
              />
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setActive((a) => (a === 0 ? slides.length - 1 : a - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/30 transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          >
            <ChevronLeftIcon size={18} />
          </button>
          <button
            onClick={() => setActive((a) => (a === slides.length - 1 ? 0 : a + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/30 transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          >
            <ChevronRightIcon size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className="transition-all rounded-full"
                style={{ width: i === active ? 24 : 7, height: 7, backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </div>

        {/* Right offer tiles */}
        <div className="hidden xl:flex flex-col gap-3" style={{ width: 182 }}>
          {offerCards.map((card) => (
            <Link key={card.label} to={card.to}
              className="flex-1 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: card.bg, border: `1px solid ${card.accent}22`, minHeight: 82 }}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-gray-800">{card.label}</p>
                <p className="text-[10px] font-bold" style={{ color: card.accent }}>{card.badge}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
