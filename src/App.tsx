import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LeftSidebar from './components/LeftSidebar'
import AIChatbot from './components/AIChatbot'
import CommandPalette from './components/CommandPalette'
import LoginModal from './components/LoginModal'
import SaleEntranceModal from './components/SaleEntranceModal'
import NetworkStatusBanner from './components/NetworkStatusBanner'
import { ToastProvider } from './components/Toast'
import { CartProvider } from './contexts/CartContext'
import { WishlistProvider } from './contexts/WishlistContext'

// Pages
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ProductPage from './pages/ProductPage'
import WishlistPage from './pages/WishlistPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [saleModalOpen, setSaleModalOpen] = useState(false)
  const sidebarW = sidebarCollapsed ? 64 : 240

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true) }
    }
    const handleOpenLogin = () => setLoginOpen(true)
    const handleOpenSale = () => setSaleModalOpen(true)
    
    document.addEventListener('keydown', handle)
    window.addEventListener('open-login-modal', handleOpenLogin as EventListener)
    window.addEventListener('open-sale-entrance', handleOpenSale as EventListener)

    // First visit auto-reveal
    const hasSeenSale = sessionStorage.getItem('snapdeal_sale_entrance_seen')
    let timer: NodeJS.Timeout | null = null
    if (!hasSeenSale) {
      timer = setTimeout(() => {
        setSaleModalOpen(true)
        sessionStorage.setItem('snapdeal_sale_entrance_seen', 'true')
      }, 700)
    }
    
    return () => {
      document.removeEventListener('keydown', handle)
      window.removeEventListener('open-login-modal', handleOpenLogin as EventListener)
      window.removeEventListener('open-sale-entrance', handleOpenSale as EventListener)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#f9fafb' }}>
            <NetworkStatusBanner />
            <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} onCommandPalette={() => setCmdOpen(true)} onLoginClick={() => setLoginOpen(true)} />
            <LeftSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <main style={{ paddingTop: 104, paddingLeft: sidebarW, transition: 'padding-left 0.25s cubic-bezier(0.4,0,0.2,1)', minHeight: '100vh' }}>
              <div style={{ backgroundColor: '#ffffff' }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
              </div>
            </main>

            <AIChatbot open={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
            <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
            <SaleEntranceModal isOpen={saleModalOpen} onClose={() => setSaleModalOpen(false)} onOpen={() => setSaleModalOpen(true)} />
          </div>
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  )
}
