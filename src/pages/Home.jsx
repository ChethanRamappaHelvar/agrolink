import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { publicService } from '../services/publicService'
import { useAsync } from '../hooks/useAsync'
import { useShopActions } from '../hooks/useShopActions'
import ProductCard from '../components/ProductCard'
import { Spinner } from '../components/ui'
import BannerStrip from '../components/BannerStrip'
import RecentlyViewed from '../components/RecentlyViewed'

export default function Home() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { addToCart, toggleWish, wishIds } = useShopActions()
  const stats = useAsync(() => publicService.stats(), [])
  const cats = useAsync(() => publicService.categories(), [])
  const latest = useAsync(() => publicService.products({ size: 8, sort: 'newest' }), [])

  const submit = (e) => { e.preventDefault(); navigate('/marketplace?search=' + encodeURIComponent(search)) }
  const s = stats.data || {}

  return (
    <>
      <BannerStrip />
      <section className="hero">
        <div className="container">
          <div>
            <div className="eyebrow" style={{ color: 'var(--amber)' }}>Farm to home marketplace</div>
            <h1>Fresh from the <em>farm</em>,<br />straight to your table.</h1>
            <p className="lead">Buy vegetables, grains, spices and dairy directly from verified farmers. Fair prices for growers, honest freshness for you.</p>
            <form className="hero-search" onSubmit={submit}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tomatoes, basmati rice, ghee..." />
              <button className="btn btn-amber" type="submit">Search</button>
            </form>
            <div className="row mt2">
              <Link to="/register" className="btn btn-amber">Start selling as a farmer</Link>
              <Link to="/marketplace" className="btn btn-outline">Browse marketplace</Link>
            </div>
          </div>
          <div className="hero-cards">
            <div className="hero-stat"><b>{s.farmers ?? '–'}</b><span>Farmers on board</span></div>
            <div className="hero-stat"><b>{s.products ?? '–'}</b><span>Fresh products</span></div>
            <div className="hero-stat"><b>{s.customers ?? '–'}</b><span>Happy buyers</span></div>
            <div className="hero-stat"><b>{s.deliveredOrders ?? '–'}</b><span>Orders delivered</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head"><div><div className="eyebrow">Shop by category</div><h2>What are you looking for?</h2></div></div>
          {cats.loading ? <Spinner /> : (
            <div className="cat-grid">
              {(cats.data || []).map((c) => (
                <Link key={c.id} to={'/marketplace?categoryId=' + c.id} className="cat-tile">
                  <span className="ic">{c.icon}</span><b>{c.name}</b><small>{c.productCount} items</small>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: 'rgba(28,21,18,.55)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', paddingTop: 54 }}>
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">Just harvested</div><h2>Latest arrivals</h2><p>Fresh listings from farmers across India.</p></div>
            <Link to="/marketplace" className="btn btn-outline">View all →</Link>
          </div>
          {latest.loading ? <Spinner /> : (
            <div className="product-grid">
              {(latest.data?.items || []).map((p) => <ProductCard key={p.id} product={p} wished={wishIds.has(p.id)} onWish={toggleWish} onAdd={addToCart} />)}
            </div>
          )}
        </div>
      </section>

      <RecentlyViewed />

      <section className="section">
        <div className="container">
          <div className="section-head"><div><div className="eyebrow">Simple &amp; transparent</div><h2>How AgroLink works</h2></div></div>
          <div className="steps">
            {[['1', 'Farmers list produce', 'Farmers add products with price, stock and photos. Admin verifies every listing.'],
              ['2', 'You browse &amp; order', 'Search by category, price or location and add products to your cart.'],
              ['3', 'Farmer ships', 'Track your order from Placed to Delivered, step by step.'],
              ['4', 'Review &amp; reorder', 'Rate what you received and help others buy better.']].map(([n, t, d]) => (
              <div className="step" key={n}><div className="n">{n}</div><h3 dangerouslySetInnerHTML={{ __html: t }} /><p className="soft small" style={{ marginTop: 6 }} dangerouslySetInnerHTML={{ __html: d }} /></div>
            ))}
          </div>
          <div className="cta-band mt2">
            <div><h2>Are you a farmer?</h2><p className="soft">Manage farms, crops, stock and orders in one place and sell directly to customers.</p></div>
            <Link to="/register" className="btn btn-primary">Create farmer account</Link>
          </div>
        </div>
      </section>
    </>
  )
}
