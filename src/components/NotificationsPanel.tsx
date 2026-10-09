import { useState } from 'react'
import { CloseIcon } from './Icons'

const categories = ['All', 'Orders', 'Price Drops', 'Offers', 'Wishlist', 'Flash Deals', 'Returns']

const notifications: any[] = []

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [read, setRead] = useState<number[]>([])

  const isRead = (id: number) => notifications.find((n) => n.id === id)?.read || read.includes(id)
  const markRead = (id: number) => setRead((p) => [...new Set([...p, id])])
  const markAll = () => setRead(notifications.map((n) => n.id))

  const filtered = notifications.filter(
    (n) => (activeTab === 'All' || n.cat === activeTab) &&
      (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
  )

  const unread = notifications.filter((n) => !isRead(n.id)).length

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ top: 112 }} onClick={onClose} />
      <div
        className="fixed z-50 bg-white flex flex-col"
        style={{
          top: 112,
          right: 24,
          width: 420,
          maxHeight: 620,
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.14)',
          border: '1px solid #f0f0f0',
          animation: 'panelIn 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #f5f5f5' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 text-[16px]">Notifications</p>
              {unread > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: '#E40046' }}>{unread}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={markAll} className="text-[12px] font-semibold text-gray-400 hover:text-[#E40046] transition-colors">Mark all read</button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><CloseIcon size={18} /></button>
            </div>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications…"
            className="w-full px-3 py-2 rounded-xl text-[13px] font-medium outline-none"
            style={{ backgroundColor: '#f8f8f8', border: '1px solid #f0f0f0' }}
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0" style={{ borderBottom: '1px solid #f5f5f5' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveTab(c)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
              style={{
                backgroundColor: activeTab === c ? '#E40046' : '#f5f5f5',
                color: activeTab === c ? '#fff' : '#555',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className="flex gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:shadow-sm"
              style={{
                border: '1px solid #f0f0f0',
                backgroundColor: isRead(n.id) ? '#fff' : n.bg,
                opacity: isRead(n.id) ? 0.85 : 1,
              }}
            >
              {/* Icon or image */}
              <div className="shrink-0 relative">
                {n.img ? (
                  <img src={n.img} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: n.bg }}>
                    {n.icon}
                  </div>
                )}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                  style={{ backgroundColor: n.color }}
                >
                  {n.icon}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold text-gray-800 leading-snug">{n.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isRead(n.id) && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E40046' }} />}
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{n.time}</span>
                  </div>
                </div>
                <p className="text-[12px] font-medium text-gray-600 mt-0.5 leading-snug">{n.body}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{n.sub}</p>
                <button
                  className="mt-2 px-3 py-1 rounded-lg text-[11px] font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: n.color }}
                >
                  {n.action}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">🔔</p>
              <p className="text-[14px] font-semibold">No notifications here</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes panelIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </>
  )
}
