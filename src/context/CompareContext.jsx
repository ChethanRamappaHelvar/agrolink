import { createContext, useContext, useState } from 'react'

// Product comparison list (max 3). Saved in localStorage so it survives a refresh.
const KEY = 'agri_compare'
const CompareContext = createContext({ items: [], toggle: () => {}, has: () => false, clear: () => {} })

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export function CompareProvider({ children }) {
  const [items, setItems] = useState(read)
  const save = (list) => { setItems(list); try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore */ } }

  const has = (id) => items.some((x) => x.id === id)
  /** returns an error text when the list is full, otherwise null */
  const toggle = (p) => {
    if (has(p.id)) { save(items.filter((x) => x.id !== p.id)); return null }
    if (items.length >= 3) return 'You can compare up to 3 products'
    save([...items, p]); return null
  }
  const clear = () => save([])
  return <CompareContext.Provider value={{ items, toggle, has, clear }}>{children}</CompareContext.Provider>
}

export const useCompare = () => useContext(CompareContext)
