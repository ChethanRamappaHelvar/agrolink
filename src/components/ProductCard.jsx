import { Link } from 'react-router-dom'
import { imageSrc } from '../services/api'
import { money, emojiFor } from '../utils/format'
import { Stars } from './ui'
import { useCompare } from '../context/CompareContext'
import { useToast } from '../context/ToastContext'

/**
 * One product tile. Props are the data/functions given by the parent (props drilling):
 *  product, wished (is it in the wishlist), onWish(product), onAdd(product)
 */
export default function ProductCard({ product: p, wished, onWish, onAdd, showActions = true }) {
  const out = p.stock <= 0
  const cmp = useCompare()
  const toast = useToast()
  const onCompare = () => { const err = cmp.toggle(p); if (err) toast.error(err) }
  return (
    <div className="pcard">
      <Link to={'/product/' + p.id}>
        <div className="pimg">{p.imageUrl ? <img src={imageSrc(p.imageUrl)} alt={p.name} /> : emojiFor(p)}</div>
      </Link>
      {showActions && <button className={'cmp-check' + (cmp.has(p.id) ? ' on' : '')} onClick={onCompare} title="Add to compare">{cmp.has(p.id) ? '✓ Compare' : '⚖ Compare'}</button>}
      {out && <span className="badge b-red tag">Out of stock</span>}
      {!out && p.stock <= p.lowStockThreshold && <span className="badge b-amber tag">Few left</span>}
      {showActions && onWish && <button className="wish" onClick={() => onWish(p)} title="Wishlist">{wished ? '❤️' : '🤍'}</button>}
      <div className="pbody">
        <span className="muted small">{p.categoryName}</span>
        <Link to={'/product/' + p.id}><h4>{p.name}</h4></Link>
        <div className="row gap-sm"><Stars value={p.avgRating} /><span className="muted small">({p.reviewCount})</span></div>
        <div className="pfarmer">👨‍🌾 {p.farmerName}{p.farmerVerified && ' ✔️'} · 📍 {p.location || p.state || 'India'}</div>
        <div className="row between" style={{ marginTop: 'auto', paddingTop: 8 }}>
          <div className="pprice">{money(p.price)} <small>/ {p.unit}</small></div>
          {showActions && onAdd && <button className="btn btn-primary btn-sm" disabled={out} onClick={() => onAdd(p)}>{out ? 'Sold out' : '+ Add'}</button>}
        </div>
      </div>
    </div>
  )
}
