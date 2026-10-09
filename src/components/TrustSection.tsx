const trustItems = [
  {
    icon: (
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#E40046" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: 'Secure Payments',
    desc: 'SSL encrypted checkout. UPI, Cards, Net Banking & COD accepted.',
    bg: '#fff5f7',
    accent: '#E40046',
  },
  {
    icon: (
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
    ),
    title: 'Easy 7-Day Returns',
    desc: 'Not satisfied? Return within 7 days for a full refund to your original payment.',
    bg: '#f0fdf4',
    accent: '#22c55e',
  },
  {
    icon: (
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Verified Sellers',
    desc: 'Every seller is verified. Authentic products with quality guarantee.',
    bg: '#eff6ff',
    accent: '#3b82f6',
  },
  {
    icon: (
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: '24/7 Customer Support',
    desc: 'Chat, call or email. Our support team is always here to help you.',
    bg: '#fff7ed',
    accent: '#f97316',
  },
]

export default function TrustSection() {
  return (
    <div className="py-10 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {trustItems.map((item) => (
          <div key={item.title}
            className="flex flex-col items-center text-center p-5 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: item.bg, border: `1px solid ${item.accent}22` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${item.accent}15` }}>
              {item.icon}
            </div>
            <h3 className="text-[14px] font-bold text-gray-800 mb-1">{item.title}</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
