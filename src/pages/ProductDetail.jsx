import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicService } from '../services/publicService'
import { useAsync } from '../hooks/useAsync'
import { useShopActions } from '../hooks/useShopActions'
import { imageSrc } from '../services/api'
import { money, dateOnly, emojiFor } from '../utils/format'
import { Stars, Spinner, ErrorBox, Badge } from '../components/ui'
import ProductCard from '../components/ProductCard'
import RecentlyViewed from '../components/RecentlyViewed'
import { addRecent } from '../utils/recent'

export default function ProductDetail() {
  const { id } = useParams()
  const [qty, setQty] = useState(1)
  const [img, setImg] = useState(0)
  const { addToCart, toggleWish, wishIds } = useShopActions()
  const { data: p, loading, error } = useAsync(() => publicService.product(id), [id])
  const reviews = useAsync(() => publicService.reviews(id), [id])
  const recs = useAsync(() => publicService.recommendations(id), [id])

  useEffect(() => { if (p) addRecent(p) }, [p])

  if (loading) return <Spinner />
  if (error) return <div className="container" style={{ paddingTop: 40 }}><ErrorBox message={error} /><Link className="btn btn-outline" to="/marketplace">← Back to marketplace</Link></div>

  const out = p.stock <= 0
  const images = p.images || []
  const f = p.farmer

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      <p className="muted small mb"><Link to="/marketplace">Marketplace</Link> / {p.categoryName} / {p.name}</p>
      <div className="detail-grid">
        <div>
          <div className="detail-img">{images[img] ? <img src={imageSrc(images[img])} alt={p.name} /> : emojiFor(p)}</div>
          {images.length > 1 && <div className="row mt">{images.map((u, i) => <button key={u} className={'chip' + (i === img ? ' on' : '')} onClick={() => setImg(i)}>Photo {i + 1}</button>)}</div>}
        </div>
        <div>
          <span className="badge b-green">{p.categoryIcon} {p.categoryName}</span>
          <h1 style={{ fontSize: '2.2rem', margin: '10px 0' }}>{p.name}</h1>
          <div className="row"><Stars value={p.avgRating} /><span className="soft small">{p.avgRating || 'No ratings yet'} · {p.reviewCount} review(s)</span></div>
          <div className="pprice mt" style={{ fontSize: '2.1rem' }}>{money(p.price)} <small>per {p.unit}</small></div>
          <p className="soft mt">{p.description || 'Fresh produce directly from the farm.'}</p>
          <div className="meta-grid">
            <div><small>Quality</small>{p.quality || '-'}</div>
            <div><small>Harvest date</small>{dateOnly(p.harvestDate)}</div>
            <div><small>Best before</small>{dateOnly(p.expiryDate)}</div>
            <div><small>Availability</small>{out ? <Badge status="OUT" text="Out of stock" /> : <b style={{ color: 'var(--accent-light)' }}>{p.stock} {p.unit} in stock</b>}</div>
          </div>
          <div className="row">
            <div className="qty">
              <button disabled={qty <= 1} onClick={() => setQty(qty - 1)}>−</button><span>{qty}</span>
              <button disabled={qty >= p.stock} onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn btn-primary" disabled={out} onClick={() => addToCart(p, qty)}>🛒 Add to cart</button>
            <button className="btn btn-outline" onClick={() => toggleWish(p)}>{wishIds.has(p.id) ? '❤️ Saved' : '🤍 Wishlist'}</button>
          </div>
          {!out && qty >= p.stock && <p className="small muted mt">You selected the maximum available quantity.</p>}

          <div className="card mt2" style={{ background: 'var(--surface-2)', border: 'none' }}>
            <div className="row">
              <span className="avatar" style={{ width: 54, height: 54, fontSize: '1.3rem' }}>👨‍🌾</span>
              <div className="grow">
                <b>{f.name}</b> {f.verified && <span className="badge b-green">✔ Verified farmer</span>}
                <div className="soft small">📍 {f.location}{f.state ? ', ' + f.state : ''} · {f.experienceYears ? f.experienceYears + ' yrs experience · ' : ''}{f.productCount} products</div>
              </div>
            </div>
            {f.bio && <p className="soft small mt">{f.bio}</p>}
          </div>
        </div>
      </div>

      <div className="card mt2">
        <h3>Customer reviews</h3>
        {reviews.loading ? <Spinner /> : (reviews.data || []).length === 0
          ? <p className="muted">No reviews yet. Buy this product and be the first to review it after delivery!</p>
          : reviews.data.map((r) => (
            <div className="review" key={r.id}>
              <div className="row between"><b>{r.customerName}</b><span className="muted small">{dateOnly(r.createdAt)}</span></div>
              <Stars value={r.rating} />
              {r.comment && <p className="soft" style={{ marginTop: 4 }}>{r.comment}</p>}
            </div>))}
      </div>

      {(recs.data || []).length > 0 && (
        <div className="mt2">
          <h2 className="mb">You may also like</h2>
          <div className="product-grid">
            {recs.data.slice(0, 4).map((r) => <ProductCard key={r.id} product={r} wished={wishIds.has(r.id)} onWish={toggleWish} onAdd={addToCart} />)}
          </div>
        </div>
      )}
      <RecentlyViewed key={id} skipId={Number(id)} inline />
    </div>
  )
}
