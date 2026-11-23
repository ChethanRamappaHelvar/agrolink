import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { publicService } from '../services/publicService'
import { useShopActions } from '../hooks/useShopActions'
import ProductCard from '../components/ProductCard'
import { Empty, Pagination, Spinner, ErrorBox } from '../components/ui'

/** Left filter panel. All values + setters come from the parent (props drilling). */
function FilterPanel({ filters, setFilters, categories, locations, onClear }) {
  const set = (k, v) => setFilters({ ...filters, [k]: v, page: 0 })
  return (
    <aside className="card filters">
      <div className="row between"><h3 style={{ margin: 0 }}>Filters</h3><button className="btn btn-ghost btn-sm" onClick={onClear}>Clear</button></div>
      <h4>Category</h4>
      <div className="chip-list">
        <button className={'chip' + (!filters.categoryId ? ' on' : '')} onClick={() => set('categoryId', '')}>All</button>
        {categories.map((c) => <button key={c.id} className={'chip' + (String(filters.categoryId) === String(c.id) ? ' on' : '')} onClick={() => set('categoryId', c.id)}>{c.icon} {c.name}</button>)}
      </div>
      <h4>Price range (₹)</h4>
      <div className="row">
        <input className="input" type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={(e) => set('minPrice', e.target.value)} style={{ width: 90 }} />
        <span>–</span>
        <input className="input" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} style={{ width: 90 }} />
      </div>
      <h4>Farmer location</h4>
      <select className="input" value={filters.location} onChange={(e) => set('location', e.target.value)}>
        <option value="">All locations</option>
        {locations.map((l) => <option key={l}>{l}</option>)}
      </select>
    </aside>
  )
}

const EMPTY = { search: '', categoryId: '', minPrice: '', maxPrice: '', location: '', sort: 'newest', page: 0 }

export default function Marketplace() {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState({ ...EMPTY, search: params.get('search') || '', categoryId: params.get('categoryId') || '' })
  const [searchText, setSearchText] = useState(filters.search)
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart, toggleWish, wishIds } = useShopActions()

  useEffect(() => { publicService.categories().then(setCategories).catch(() => {}); publicService.locations().then(setLocations).catch(() => {}) }, [])

  // when the URL changes (e.g. clicking a category on the home page)
  useEffect(() => {
    const s = params.get('search') || ''
    setSearchText(s)
    setFilters((f) => ({ ...f, search: s, categoryId: params.get('categoryId') || '', page: 0 }))
  }, [params])

  // wait 400 ms after typing before searching (debounce)
  useEffect(() => {
    const t = setTimeout(() => { if (searchText !== filters.search) setFilters((f) => ({ ...f, search: searchText, page: 0 })) }, 400)
    return () => clearTimeout(t)
  }, [searchText])

  useEffect(() => {
    setLoading(true)
    setError('')
    publicService.products({ ...filters, size: 12 })
      .then(setResult).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [filters])

  const clear = () => { setSearchText(''); setFilters(EMPTY) }

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div><div className="eyebrow">Marketplace</div><h2>Farm fresh products</h2>{result && <p>{result.totalItems} products found</p>}</div>
        <div className="row">
          <input className="input" style={{ width: 260 }} placeholder="🔍 Search products..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <select className="input" style={{ width: 190 }} value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 0 })}>
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>
      <div className="shop-layout">
        <FilterPanel filters={filters} setFilters={setFilters} categories={categories} locations={locations} onClear={clear} />
        <div>
          <ErrorBox message={error} />
          {loading ? <Spinner /> : result && result.items.length === 0 ? (
            <div className="card"><Empty icon="🔎" title="No products found" text="Try changing the filters or search words."><button className="btn btn-primary" onClick={clear}>Clear filters</button></Empty></div>
          ) : (
            <>
              <div className="product-grid">
                {result?.items.map((p) => <ProductCard key={p.id} product={p} wished={wishIds.has(p.id)} onWish={toggleWish} onAdd={addToCart} />)}
              </div>
              <Pagination page={result?.page || 0} totalPages={result?.totalPages} onChange={(p) => { setFilters({ ...filters, page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
