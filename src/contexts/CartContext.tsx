import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { getProductById, ALL_SUPPLEMENTAL_PRODUCTS, isValidUUID } from '../services/products'

export interface CartItem {
  id: string // cart item id
  product_id: string
  name: string
  img: string
  price: number
  original: number
  qty: number
  seller: string
  delivery: string
  color: string
  hasEMI: boolean
  stock: number
}

interface CartContextType {
  cart: CartItem[]
  cartCount: number
  loading: boolean
  subtotal: number
  originalTotal: number
  discount: number
  deliveryFee: number
  total: number
  addToCart: (productId: string, qty: number, color?: string) => Promise<{ success: boolean; error?: any }>
  updateQuantity: (id: string, delta: number) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  clearCart: () => Promise<void>
}

const GUEST_CART_KEY = 'snapdeal_guest_cart'
const getUserCartKey = (userId?: string) => userId ? `snapdeal_user_cart_${userId}` : GUEST_CART_KEY

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart from localStorage (guest or user-specific fallback)
  const loadLocalCart = (userId?: string): CartItem[] => {
    try {
      const key = getUserCartKey(userId)
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Save cart to localStorage
  const saveLocalCart = (items: CartItem[], userId?: string) => {
    try {
      const key = getUserCartKey(userId)
      localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
  }

  const fetchCart = async () => {
    if (!user) {
      setCart(loadLocalCart())
      setLoading(false)
      return
    }

    try {
      // 1. Check if guest cart items exist when user logs in and migrate
      const guestItems = loadLocalCart()
      let localUserItems = loadLocalCart(user.id)

      if (guestItems.length > 0) {
        for (const gItem of guestItems) {
          const isSupp = ALL_SUPPLEMENTAL_PRODUCTS.some(p => p.id === gItem.product_id)
          if (!isSupp && isValidUUID(gItem.product_id)) {
            try {
              await supabase.from('cart_items').upsert({
                user_id: user.id,
                product_id: gItem.product_id,
                selected_color: gItem.color || 'Default',
                quantity: Math.min(gItem.qty, 10),
              }, { onConflict: 'user_id,product_id,selected_color' })
            } catch (e) {
              console.warn('Guest migration DB upsert skipped for item:', gItem.product_id, e)
            }
          }
          // Merge into localUserItems
          const existingLocal = localUserItems.find(l => l.product_id === gItem.product_id && l.color === gItem.color)
          if (existingLocal) {
            existingLocal.qty = Math.min(existingLocal.qty + gItem.qty, 10)
          } else {
            localUserItems.push(gItem)
          }
        }
        localStorage.removeItem(GUEST_CART_KEY)
        saveLocalCart(localUserItems, user.id)
      }

      // 2. Fetch from Supabase cart_items table
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          selected_color,
          product_id,
          products (
            name,
            images,
            price,
            original_price,
            seller,
            stock_quantity,
            offers,
            delivery
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      let dbItems: CartItem[] = []
      if (!error && data) {
        dbItems = await Promise.all(data.map(async (item: any) => {
          let product = item.products
          if (!product) {
            product = await getProductById(item.product_id)
          }
          const images = product?.images || []
          const offers = product?.offers || []
          const hasEMI = offers.some((o: any) => o.text && o.text.toLowerCase().includes('emi'))

          return {
            id: item.id,
            product_id: item.product_id,
            name: product?.name || 'Product',
            img: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format',
            price: Number(product?.price) || 0,
            original: Number(product?.original_price) || Number(product?.price) || 0,
            qty: item.quantity,
            seller: product?.seller || 'Snapdeal Official',
            delivery: product?.delivery || 'Tomorrow',
            color: item.selected_color || 'Default',
            hasEMI,
            stock: product?.stock_quantity || 10
          }
        }))
      }

      // 3. Merge DB items with localUserItems (which contains supplemental products)
      const mergedMap = new Map<string, CartItem>()
      for (const item of dbItems) {
        mergedMap.set(`${item.product_id}_${item.color}`, item)
      }
      for (const item of localUserItems) {
        const key = `${item.product_id}_${item.color}`
        if (!mergedMap.has(key)) {
          mergedMap.set(key, item)
        }
      }

      const merged = Array.from(mergedMap.values())
      setCart(merged)
      saveLocalCart(merged, user.id)
    } catch (err) {
      console.error('Error in fetchCart:', err)
      const fallback = loadLocalCart(user.id)
      setCart(fallback.length > 0 ? fallback : loadLocalCart())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()

    if (user) {
      const channel = supabase
        .channel('cart_items_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` }, () => {
          fetchCart()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      // Sync guest cart across browser tabs
      const handleStorage = (e: StorageEvent) => {
        if (e.key === GUEST_CART_KEY) {
          setCart(loadLocalCart())
        }
      }
      window.addEventListener('storage', handleStorage)
      return () => window.removeEventListener('storage', handleStorage)
    }
  }, [user])

  // In-flight mutex set to prevent rapid concurrent inserts
  const inFlightAdds = useState(() => new Set<string>())[0]

  const addToCart = async (productId: string, qty: number, color?: string) => {
    const col = color || 'Default'
    const lockKey = `${productId}_${col}`

    if (inFlightAdds.has(lockKey)) {
      return { success: true } // Debounced / in-flight protection
    }
    inFlightAdds.add(lockKey)

    try {
      // 1. Resolve product details
      let product = await getProductById(productId)
      if (!product) {
        const supp = ALL_SUPPLEMENTAL_PRODUCTS.find(p => p.id === productId || String(p.id).toLowerCase() === String(productId).toLowerCase())
        if (supp) {
          product = supp
        }
      }

      if (!product) {
        console.error('Product not found for cart', productId)
        return { success: false, error: 'Product not found.' }
      }

      if (product.stock_quantity <= 0) {
        return { success: false, error: 'This item is currently out of stock.' }
      }

      const availableStock = product.stock_quantity || 10
      const maxAllowed = Math.min(availableStock, 10)
      const images = product.images || []
      const offers = product.offers || []
      const hasEMI = offers.some((o: any) => o.text && o.text.toLowerCase().includes('emi'))
      const img = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format'

      // GUEST USER FLOW
      if (!user) {
        const currentGuest = loadLocalCart()
        const existingIdx = currentGuest.findIndex(c => c.product_id === productId && c.color === col)

        if (existingIdx > -1) {
          const existing = currentGuest[existingIdx]
          const newQty = Math.min(existing.qty + qty, maxAllowed)
          currentGuest[existingIdx] = { ...existing, qty: newQty, stock: availableStock }
          saveLocalCart(currentGuest)
          setCart([...currentGuest])
          return { success: true }
        }

        const newItem: CartItem = {
          id: 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          product_id: productId,
          name: product.name,
          img,
          price: Number(product.price) || 0,
          original: Number(product.original_price) || Number(product.price) || 0,
          qty: Math.min(Math.max(1, qty), maxAllowed),
          seller: product.seller || 'Snapdeal Official',
          delivery: product.delivery || 'Tomorrow',
          color: col,
          hasEMI,
          stock: availableStock
        }

        const updated = [...currentGuest, newItem]
        saveLocalCart(updated)
        setCart(updated)
        return { success: true }
      }

      // LOGGED-IN USER FLOW (Resilient Hybrid Architecture)
      const isSupplemental = ALL_SUPPLEMENTAL_PRODUCTS.some(p => p.id === productId)
      let syncedDbId: string | null = null

      if (!isSupplemental && isValidUUID(productId)) {
        try {
          const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('selected_color', col)
            .maybeSingle()

          if (existingItem) {
            const newQty = Math.min(existingItem.quantity + qty, maxAllowed)
            const { error: updateErr } = await supabase
              .from('cart_items')
              .update({ quantity: newQty })
              .eq('id', existingItem.id)
            if (!updateErr) syncedDbId = existingItem.id
          } else {
            const { data: insertedItem, error: insertErr } = await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: productId,
                selected_color: col,
                quantity: Math.min(Math.max(1, qty), maxAllowed)
              })
              .select('id')
              .maybeSingle()
            if (!insertErr && insertedItem) syncedDbId = insertedItem.id
          }
        } catch (dbErr) {
          console.warn('Supabase cart sync fallback to local store for user:', user.id, dbErr)
        }
      }

      // Synchronize in-memory cart and local user cache immediately
      const currentCart = [...cart]
      const existingIdx = currentCart.findIndex(c => c.product_id === productId && c.color === col)

      if (existingIdx > -1) {
        const existing = currentCart[existingIdx]
        const newQty = Math.min(existing.qty + qty, maxAllowed)
        currentCart[existingIdx] = {
          ...existing,
          qty: newQty,
          id: syncedDbId || existing.id,
          stock: availableStock
        }
      } else {
        const newItem: CartItem = {
          id: syncedDbId || ('local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
          product_id: productId,
          name: product.name,
          img,
          price: Number(product.price) || 0,
          original: Number(product.original_price) || Number(product.price) || 0,
          qty: Math.min(Math.max(1, qty), maxAllowed),
          seller: product.seller || 'Snapdeal Official',
          delivery: product.delivery || 'Tomorrow',
          color: col,
          hasEMI,
          stock: availableStock
        }
        currentCart.push(newItem)
      }

      setCart(currentCart)
      saveLocalCart(currentCart, user.id)
      return { success: true }
    } finally {
      inFlightAdds.delete(lockKey)
    }
  }

  const updateQuantity = async (id: string, delta: number) => {
    const item = cart.find(c => c.id === id)
    if (!item) return

    const newQty = Math.max(1, Math.min(item.qty + delta, Math.min(item.stock, 10)))
    if (newQty === item.qty) return

    const updated = cart.map(c => c.id === id ? { ...c, qty: newQty } : c)
    setCart(updated)

    if (!user) {
      saveLocalCart(updated)
      return
    }

    saveLocalCart(updated, user.id)

    if (!id.startsWith('local_') && !id.startsWith('guest_') && isValidUUID(id)) {
      try {
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', id)
      } catch (err) {
        console.warn('Could not update Supabase cart quantity:', err)
      }
    }
  }

  const removeFromCart = async (id: string) => {
    const updated = cart.filter(c => c.id !== id)
    setCart(updated)

    if (!user) {
      saveLocalCart(updated)
      return
    }

    saveLocalCart(updated, user.id)

    if (!id.startsWith('local_') && !id.startsWith('guest_') && isValidUUID(id)) {
      try {
        await supabase.from('cart_items').delete().eq('id', id)
      } catch (err) {
        console.warn('Could not delete from Supabase cart:', err)
      }
    }
  }

  const clearCart = async () => {
    setCart([])
    localStorage.removeItem(GUEST_CART_KEY)

    if (user) {
      localStorage.removeItem(getUserCartKey(user.id))
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id)
      } catch (err) {
        console.warn('Could not clear Supabase cart:', err)
      }
    }
  }

  const cartCount = cart.reduce((total, item) => total + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const originalTotal = cart.reduce((sum, item) => sum + (item.original || item.price) * item.qty, 0)
  const discount = Math.max(0, originalTotal - subtotal)
  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 49
  const total = subtotal + deliveryFee

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        subtotal,
        originalTotal,
        discount,
        deliveryFee,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
