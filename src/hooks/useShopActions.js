import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBuyer } from '../context/BuyerContext'
import { useToast } from '../context/ToastContext'
import { buyerService } from '../services/buyerService'

/** Add-to-cart and wishlist actions shared by Home, Marketplace, Product detail and Wishlist pages. */
export function useShopActions() {
  const { user } = useAuth()
  const { wishIds, setWishIds, reload } = useBuyer()
  const toast = useToast()
  const navigate = useNavigate()

  const needBuyer = () => {
    if (!user) { toast.error('Please log in to continue'); navigate('/login'); return false }
    if (user.role !== 'CUSTOMER') { toast.error('Only customer accounts can shop. Please log in as a buyer.'); return false }
    return true
  }

  const addToCart = async (p, qty = 1) => {
    if (!needBuyer()) return false
    try {
      await buyerService.addToCart(p.id, qty)
      toast.success(p.name + ' added to cart')
      reload()
      return true
    } catch (e) { toast.error(e.message); return false }
  }

  const toggleWish = async (p) => {
    if (!needBuyer()) return
    try {
      if (wishIds.has(p.id)) {
        await buyerService.removeWish(p.id)
        const next = new Set(wishIds); next.delete(p.id); setWishIds(next)
        toast.success('Removed from wishlist')
      } else {
        await buyerService.addWish(p.id)
        setWishIds(new Set(wishIds).add(p.id))
        toast.success('Saved to wishlist')
      }
      reload()
    } catch (e) { toast.error(e.message) }
  }

  return { addToCart, toggleWish, wishIds }
}
