import { Link } from 'react-router-dom'

interface SaleHeroEntranceProps {
  onOpenModal: () => void
}

export default function SaleHeroEntrance({ onOpenModal }: SaleHeroEntranceProps) {
  const stealZones = [
    {
      title: '₹399 & UNDER',
      subtitle: 'Daily wear, Tops & Accessories',
      tag: 'CRAZY STEALS',
      gradient: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
      img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=320&h=240&fit=crop&auto=format',
      link: '/search?q=under+500',
      badge: 'Budget Store',
    },
    {
      title: 'FLAT 70% OFF',
      subtitle: 'Ethnic Kurtas, Sarees & Jeans',
      tag: 'LIMITED STOCKS',
      gradient: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)',
      img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=320&h=240&fit=crop&auto=format',
      link: '/search?cat=traditional',
      badge: 'Festive Wear',
    },
    {
      title: 'BUY 1 GET 1 FREE',
      subtitle: 'Branded Footwear & Sneakers',
      tag: 'DOUBLE VALUE',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=240&fit=crop&auto=format',
      link: '/search?cat=footwear',
      badge: 'Shoes Mania',
    },
    {
      title: 'MIN 60% OFF',
      subtitle: 'Luxury Watches & Tech Gadgets',
      tag: 'TOP BRANDS',
      gradient: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
      img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=320&h=240&fit=crop&auto=format',
      link: '/search?cat=watches',
      badge: 'Timeless Tech',
    },
  ]

  return (
    <div className="mb-6 mt-2">
      {/* Myntra Grand Curtain Raiser Bar */}
      <div
        className="rounded-3xl p-4 sm:p-6 text-white relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1b0728 0%, #2f083d 40%, #4a0d4a 70%, #170422 100%)',
          border: '1.5px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 8px 32px rgba(228, 0, 70, 0.25)',
        }}
      >
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Top Header of the Curtain Raiser */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest mb-1.5">
              <span>⚡</span> MYNTRA STYLE GRAND ENTRANCE <span>⚡</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>BIG FASHION FESTIVAL</span>
              <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-black uppercase tracking-wider">
                50% - 80% OFF
              </span>
            </h2>
            <p className="text-white/70 text-xs sm:text-sm font-medium mt-0.5">
              Curtain raiser offers live now! Extra flat ₹500 discount on your bag with code <span className="text-amber-300 font-mono font-bold">FESTIVAL50</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenModal}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 text-black font-extrabold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <span>UNLOCK VIP PASS</span>
              <span>🎟️</span>
            </button>
            <Link
              to="/search?cat=deals"
              className="flex-1 md:flex-none px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all text-center"
            >
              View All 500+ Deals →
            </Link>
          </div>
        </div>

        {/* 4 Interactive Steal Zone Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          {stealZones.map((zone, idx) => (
            <Link
              key={idx}
              to={zone.link}
              className="group relative rounded-2xl overflow-hidden p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-white/15 flex flex-col justify-between"
              style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)' }}
            >
              {/* Image Preview */}
              <div className="h-28 sm:h-32 rounded-xl overflow-hidden mb-3 relative bg-black/40">
                <img
                  src={zone.img}
                  alt={zone.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 border border-white/20">
                  {zone.badge}
                </span>
                <span
                  className="absolute bottom-2 right-2 text-[9px] font-extrabold px-2 py-0.5 rounded-md text-white shadow-md uppercase"
                  style={{ background: zone.gradient }}
                >
                  {zone.tag}
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  {zone.title}
                </h3>
                <p className="text-[11px] text-white/65 line-clamp-1 mt-0.5">{zone.subtitle}</p>
                <div className="mt-2.5 text-[11px] font-extrabold text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Shop Category →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
