import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { buyerService } from '../services/buyerService'
import { useAuth } from './AuthContext'

// Keeps the numbers shown on the navbar (cart, wishlist, notifications) and the wishlist ids
// so that every heart icon in the marketplace knows whether a product is already saved.
const BuyerContext = createContext({ counts: {}, wishIds: new Set(), reload: () => {}, setWishIds: () => {} })

export function BuyerProvider({ children }) {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ cartCount: 0, wishlistCount: 0, unreadNotifications: 0 })
  const [wishIds, setWishIds] = useState(new Set())

  const reload = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') return
    try {
      const [c, w] = await Promise.all([buyerService.counts(), buyerService.wishlist()])
      setCounts(c)
      setWishIds(new Set(w.map((p) => p.id)))
    } catch { /* ignore, badges are not critical */ }
  }, [user])

  useEffect(() => { reload() }, [reload])

  return <BuyerContext.Provider value={{ counts, wishIds, setWishIds, reload }}>{children}</BuyerContext.Provider>
}

export const useBuyer = () => useContext(BuyerContext)
