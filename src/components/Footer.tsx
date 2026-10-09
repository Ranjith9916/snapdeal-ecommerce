import { PhoneIcon, MailIcon, MapPinIcon, ShieldIcon, RotateCcwIcon, TruckIcon, CreditCardIcon } from './Icons'

const footerLinks = {
  'About Us': ['About Snapdeal', 'Careers', 'Press', 'Investor Relations', 'Snapdeal Stories'],
  'Help & Support': ['FAQ', 'Track Order', 'Returns & Refunds', 'Cancellation', 'Contact Us'],
  'Policies': ['Privacy Policy', 'Terms of Use', 'Infringement Policy', 'Sitemap', 'Cookie Policy'],
  'Sell on Snapdeal': ['Become a Seller', 'Seller Login', 'Seller Helpdesk', 'Seller University', 'Seller Success'],
}

const trust = [
  { Icon: TruckIcon, label: 'Free Delivery', sub: 'On orders above ₹499' },
  { Icon: RotateCcwIcon, label: 'Easy Returns', sub: '7-day return policy' },
  { Icon: ShieldIcon, label: '100% Secure', sub: 'Safe & encrypted payments' },
  { Icon: CreditCardIcon, label: 'No-Cost EMI', sub: 'On select products' },
]

const socialLinks = [
  { label: 'Fb', href: '#' },
  { label: 'Tw', href: '#' },
  { label: 'Ig', href: '#' },
  { label: 'Yt', href: '#' },
  { label: 'Li', href: '#' },
]

export default function Footer() {
  return (
    <footer className="mt-16" style={{ borderTop: '1px solid #f0f0f0' }}>
      {/* Trust Strip */}
      <div className="py-8" style={{ backgroundColor: '#fff9fa', borderBottom: '1px solid #f0e0e6' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trust.map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#fff0f3' }}
                >
                  <Icon size={22} style={{ color: '#E40046' }} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1 mb-4">
                <span className="text-2xl font-extrabold" style={{ color: '#E40046' }}>snap</span>
                <span className="text-2xl font-extrabold text-white">deal</span>
                <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: '#E40046' }} />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 font-medium">
                India's leading online marketplace with millions of products across 800+ categories.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <PhoneIcon size={13} />
                  <span>1800-200-9898 (Toll Free)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <MailIcon size={13} />
                  <span>support@snapdeal.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <MapPinIcon size={13} />
                  <span>New Delhi, India</span>
                </div>
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-white font-bold text-sm mb-4">{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 text-xs font-medium hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Strip */}
          <div
            className="flex flex-col md:flex-row items-center justify-between pt-8 gap-6"
            style={{ borderTop: '1px solid #2a2a2a' }}
          >
            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#E40046] transition-all text-xs font-bold"
                  style={{ backgroundColor: '#1e1e1e' }}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-xs font-medium">Download App:</span>
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: '#E40046' }}
              >
                App Store
              </button>
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: '#333' }}
              >
                Google Play
              </button>
            </div>

            <p className="text-gray-500 text-xs font-medium">
              © 2025 Snapdeal.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
