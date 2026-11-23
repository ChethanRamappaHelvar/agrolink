// Recently viewed products, kept only in this browser (localStorage + JSON).
const KEY = 'agri_recent'
const MAX = 8

export const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

/** Saves the small part of the product that ProductCard needs. */
export const addRecent = (p) => {
  try {
    const slim = { id: p.id, name: p.name, price: p.price, unit: p.unit, stock: p.stock, lowStockThreshold: p.lowStockThreshold,
      imageUrl: p.imageUrl || (p.images && p.images[0]) || null, categoryName: p.categoryName, categoryIcon: p.categoryIcon,
      avgRating: p.avgRating, reviewCount: p.reviewCount, farmerName: p.farmerName || p.farmer?.name, farmerVerified: p.farmerVerified ?? p.farmer?.verified,
      location: p.location || p.farmer?.location, state: p.state || p.farmer?.state }
    const list = [slim, ...getRecent().filter((x) => x.id !== p.id)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

export const clearRecent = () => { try { localStorage.removeItem(KEY) } catch { /* ignore */ } }
