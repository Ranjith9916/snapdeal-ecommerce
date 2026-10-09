interface IconProps {
  size?: number
  className?: string
  fill?: string
  stroke?: string
  style?: React.CSSProperties
}

const svg = (children: React.ReactNode, props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ?? 20}
    height={props.size ?? 20}
    viewBox="0 0 24 24"
    fill={props.fill ?? 'none'}
    stroke={props.stroke ?? 'currentColor'}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    {children}
  </svg>
)

export const SearchIcon = (p: IconProps) => svg(<><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, p)
export const CameraIcon = (p: IconProps) => svg(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>, p)
export const MicIcon = (p: IconProps) => svg(<><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 19v3M8 22h8"/></>, p)
export const BarcodeIcon = (p: IconProps) => svg(<><path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v4M15 21h4a2 2 0 0 0 2-2v-4"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/></>, p)
export const HeartIcon = (p: IconProps) => svg(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>, { ...p })
export const CartIcon = (p: IconProps) => svg(<><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>, p)
export const UserIcon = (p: IconProps) => svg(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>, p)
export const MessageIcon = (p: IconProps) => svg(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, p)
export const MenuIcon = (p: IconProps) => svg(<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>, p)
export const CloseIcon = (p: IconProps) => svg(<path d="M18 6L6 18M6 6l12 12"/>, p)
export const ChevronRightIcon = (p: IconProps) => svg(<path d="M9 18l6-6-6-6"/>, p)
export const ChevronLeftIcon = (p: IconProps) => svg(<path d="M15 18l-6-6 6-6"/>, p)
export const ChevronDownIcon = (p: IconProps) => svg(<path d="M6 9l6 6 6-6"/>, p)
export const StarIcon = (p: IconProps) => svg(<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>, { ...p })
export const ZapIcon = (p: IconProps) => svg(<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>, { ...p })
export const SendIcon = (p: IconProps) => svg(<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>, p)
export const SparklesIcon = (p: IconProps) => svg(<><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z"/><path d="M5 15l.75 2.25L8 18l-2.25.75L5 21l-.75-2.25L2 18l2.25-.75z"/></>, p)
export const BotIcon = (p: IconProps) => svg(<><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></>, p)
export const ClockIcon = (p: IconProps) => svg(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, p)
export const TruckIcon = (p: IconProps) => svg(<><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, p)
export const RotateCcwIcon = (p: IconProps) => svg(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></>, p)
export const ShieldIcon = (p: IconProps) => svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, p)
export const CreditCardIcon = (p: IconProps) => svg(<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>, p)
export const PhoneIcon = (p: IconProps) => svg(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.59 2.72h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>, p)
export const MailIcon = (p: IconProps) => svg(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, p)
export const MapPinIcon = (p: IconProps) => svg(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>, p)
export const BellIcon = (p: IconProps) => svg(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, p)
export const TagIcon = (p: IconProps) => svg(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>, p)
export const TrendingIcon = (p: IconProps) => svg(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>, p)
export const GridIcon = (p: IconProps) => svg(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>, p)
