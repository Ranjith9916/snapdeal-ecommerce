import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { getProductById, ALL_SUPPLEMENTAL_PRODUCTS, isValidUUID } from '../services/products'

export interface WishlistItem {
  id: string
  product_id: string
  folder_name: string
  products: any
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  loading: boolean
  addToWishlist: (productId: string, folderName?: string) => Promise<{ success: boolean; error?: any }>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
}

const GUEST_WISHLIST_KEY = 'snapdeal_guest_wishlist'
const getUserWishlistKey = (userId?: string) => userId ? `snapdeal_user_wishlist_${userId}` : GUEST_WISHLIST_KEY

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load wishlist from localStorage (guest or user-specific fallback)
  const loadLocalWishlist = (userId?: string): WishlistItem[] => {
    try {
      const key = getUserWishlistKey(userId)
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Save wishlist to localStorage
  const saveLocalWishlist = (items: WishlistItem[], userId?: string) => {
    try {
      const key = getUserWishlistKey(userId)
      localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e)
    }
  }

  const buildWishlistProduct = (p: any) => {
    const price = Number(p.price) || 0
    const original_price = Number(p.original_price) || price
    const discount = p.discount || (original_price > price ? Math.round(((original_price - price) / original_price) * 100) : 0)
    const images = p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format']
    return {
      id: p.id,
      name: p.name || 'Product',
      brand: p.brand || '',
      description: p.description || '',
      price,
      original_price,
      discount,
      images,
      stock: p.stock_quantity ?? p.stock ?? 10,
      stock_quantity: p.stock_quantity ?? p.stock ?? 10,
      seller: p.seller || 'Snapdeal Official',
      delivery: p.delivery || 'Tomorrow',
      category_id: p.category_id,
      rating: p.rating || 4.5,
      reviews: p.reviews || 120
    }
  }

  const fetchWishlist = async () => {
    if (!user) {
      const guestItems = loadLocalWishlist()
      const hydrated = await Promise.all(guestItems.map(async (item) => {
        if (!item.products || !item.products.name) {
          const p = await getProductById(item.product_id)
          if (p) return { ...item, products: buildWishlistProduct(p) }
        }
        return item
      }))
      setWishlist(hydrated)
      saveLocalWishlist(hydrated)
      setLoading(false)
      return
    }

    try {
      // 1. Check if guest items exist when logging in and migrate safely
      const guestItems = loadLocalWishlist()
      let localUserItems = loadLocalWishlist(user.id)

      if (guestItems.length > 0) {
        for (const gItem of guestItems) {
          const isSupp = ALL_SUPPLEMENTAL_PRODUCTS.some(p => p.id === gItem.product_id)
          if (!isSupp && isValidUUID(gItem.product_id)) {
            try {
              await supabase.from('wishlist_items').upsert({
                user_id: user.id,
                product_id: gItem.product_id,
                folder_name: gItem.folder_name || 'All',
              }, { onConflict: 'user_id,product_id' })
            } catch (e) {
              console.warn('Guest wishlist migration skipped for:', gItem.product_id, e)
            }
          }
          if (!localUserItems.some(u => u.product_id === gItem.product_id)) {
            localUserItems.push(gItem)
          }
        }
        localStorage.removeItem(GUEST_WISHLIST_KEY)
        saveLocalWishlist(localUserItems, user.id)
      }

      // 2. Fetch from Supabase wishlist_items
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          folder_name,
          products (
            *
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      let dbItems: WishlistItem[] = []
      if (!error && data) {
        dbItems = await Promise.all(data.map(async (item: any) => {
          let product = item.products
          if (!product) {
            product = await getProductById(item.product_id)
          }
          return {
            id: item.id,
            product_id: item.product_id,
            folder_name: item.folder_name || 'All',
            products: product ? buildWishlistProduct(product) : null
          }
        }))
      }

      // 3. Merge DB items with local supplemental items
      const mergedMap = new Map<string, WishlistItem>()
      for (const item of dbItems) {
        mergedMap.set(item.product_id, item)
      }
      for (const item of localUserItems) {
        if (!mergedMap.has(item.product_id)) {
          mergedMap.set(item.product_id, item)
        }
      }

      const merged = Array.from(mergedMap.values())
      setWishlist(merged)
      saveLocalWishlist(merged, user.id)
    } catch (err) {
      console.error('Error in fetchWishlist:', err)
      const fallback = loadLocalWishlist(user.id)
      setWishlist(fallback.length > 0 ? fallback : loadLocalWishlist())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()

    if (user) {
      const channel = supabase
        .channel('wishlist_items_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist_items', filter: `user_id=eq.${user.id}` }, () => {
          fetchWishlist()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === GUEST_WISHLIST_KEY) {
          setWishlist(loadLocalWishlist())
        }
      }
      window.addEventListener('storage', handleStorage)
      return () => window.removeEventListener('storage', handleStorage)
    }
  }, [user])

  const inFlightWishlist = useState(() => new Set<string>())[0]

  const addToWishlist = async (productId: string, folderName = 'All') => {
    if (!productId) return { success: false, error: 'Invalid product ID' }
    const cleanId = String(productId).trim()

    if (inFlightWishlist.has(cleanId)) {
      return { success: true }
    }
    inFlightWishlist.add(cleanId)

    try {
      // 1. Resolve product details
      let product = await getProductById(cleanId)
      if (!product) {
        const supp = ALL_SUPPLEMENTAL_PRODUCTS.find(p => p.id === cleanId || String(p.id).toLowerCase() === cleanId.toLowerCase())
        if (supp) product = supp
      }

      if (!product) {
        console.error('Product not found for wishlist', cleanId)
        return { success: false, error: 'Product not found' }
      }

      const builtProduct = buildWishlistProduct(product)

      // GUEST USER FLOW
      if (!user) {
        const current = loadLocalWishlist()
        if (current.some(w => w.product_id === cleanId)) {
          return { success: true }
        }

        const newItem: WishlistItem = {
          id: 'guest_wish_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          product_id: cleanId,
          folder_name: folderName,
          products: builtProduct
        }

        const updated = [newItem, ...current]
        saveLocalWishlist(updated)
        setWishlist(updated)
        return { success: true }
      }

      // LOGGED-IN USER FLOW (Resilient Hybrid Architecture)
      const isSupplemental = ALL_SUPPLEMENTAL_PRODUCTS.some(p => p.id === cleanId)
      let syncedDbId: string | null = null

      if (!isSupplemental && isValidUUID(cleanId)) {
        try {
          const { data, error } = await supabase
            .from('wishlist_items')
            .upsert({
              user_id: user.id,
              product_id: cleanId,
              folder_name: folderName
            }, { onConflict: 'user_id,product_id' })
            .select('id')
            .maybeSingle()

          if (!error && data) {
            syncedDbId = data.id
          }
        } catch (dbErr) {
          console.warn('Supabase wishlist upsert skipped, fallback to resilient local store:', dbErr)
        }
      }

      const current = [...wishlist]
      if (current.some(w => w.product_id === cleanId)) {
        return { success: true }
      }

      const newItem: WishlistItem = {
        id: syncedDbId || ('local_wish_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
        product_id: cleanId,
        folder_name: folderName,
        products: builtProduct
      }

      const updated = [newItem, ...current]
      setWishlist(updated)
      saveLocalWishlist(updated, user.id)
      return { success: true }
    } finally {
      inFlightWishlist.delete(cleanId)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!productId) return
    const cleanId = String(productId).trim()

    if (inFlightWishlist.has(cleanId)) {
      return
    }
    inFlightWishlist.add(cleanId)

    try {
      // Optimistic UI update
      const updated = wishlist.filter(w => w.product_id !== cleanId && String(w.product_id).toLowerCase() !== cleanId.toLowerCase())
      setWishlist(updated)

      if (!user) {
        saveLocalWishlist(updated)
        return
      }

      saveLocalWishlist(updated, user.id)

      if (isValidUUID(cleanId)) {
        try {
          await supabase
            .from('wishlist_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', cleanId)
        } catch (error) {
          console.warn('Supabase error deleting wishlist item:', error)
        }
      }
    } finally {
      inFlightWishlist.delete(cleanId)
    }
  }

  const isInWishlist = (productId: string) => {
    if (!productId) return false
    const cleanId = String(productId).trim().toLowerCase()
    return wishlist.some(w => w.product_id === productId || String(w.product_id).toLowerCase() === cleanId)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
