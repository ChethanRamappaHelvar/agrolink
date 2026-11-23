import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { useShopActions } from '../hooks/useShopActions'
import { publicService } from '../services/publicService'
import { imageSrc } from '../services/api'
import { money, dateOnly, emojiFor } from '../utils/format'
import { Empty, Spinner, Stars } from '../components/ui'

/** Side by side comparison of up to 3 products (chosen with the "Compare" chip on product cards). */
export default function Compare() {
  const { items, toggle, clear } = useCompare()
  const { addToCart } = useShopActions()
  const [full, setFull] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all(items.map((i) => publicService.product(i.id).catch(() => i))).then((r) => alive && setFull(r))
    return () => { alive = false }
  }, [items])

  if (items.length === 0) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="card"><Empty icon="⚖️" title="Nothing to compare yet" text="Tap the “Compare” chip on up to 3 product cards, then come back here.">
        <Link to="/marketplace" className="btn btn-primary">Browse marketplace</Link></Empty></div>
    </div>)
  if (!full) return <Spinner />

  const cheapest = Math.min(...full.map((p) => Number(p.price)))
  const bestRated = Math.max(...full.map((p) => Number(p.avgRating || 0)))
  const rows = [
    ['Price', (p) => <span className={Number(p.price) === cheapest && full.length > 1 ? 'cmp-best' : 'bold'}>{money(p.price)} / {p.unit}</span>],
    ['Rating', (p) => <span className={Number(p.avgRating || 0) === bestRated && bestRated > 0 && full.length > 1 ? 'cmp-best' : ''}><Stars value={p.avgRating} /> {p.avgRating || '-'} ({p.reviewCount || 0})</span>],
    ['Category', (p) => p.categoryName],
    ['Quality', (p) => p.quality || '-'],
    ['In stock', (p) => (p.stock > 0 ? p.stock + ' ' + p.unit : 'Out of stock')],
    ['Harvested', (p) => dateOnly(p.harvestDate)],
    ['Best before', (p) => dateOnly(p.expiryDate)],
    ['Farmer', (p) => (p.farmer?.name || p.farmerName) + (p.farmer?.verified || p.farmerVerified ? ' ✔️' : '')],
    ['Location', (p) => p.farmer?.location || p.location || '-'],
  ]

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      <div className="page-head"><div><h2>Compare products</h2><p>The best value in each row is highlighted.</p></div><button className="btn btn-ghost btn-sm" onClick={clear}>Clear all</button></div>
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table className="tbl cmp-table">
          <thead><tr><th></th>{full.map((p) => (
            <th key={p.id}>
              <Link to={'/product/' + p.id}><div className="pimg" style={{ height: 110, borderRadius: 12, marginBottom: 8 }}>{(p.images?.[0] || p.imageUrl) ? <img src={imageSrc(p.images?.[0] || p.imageUrl)} alt="" /> : emojiFor(p)}</div><b>{p.name}</b></Link>
              <div className="row gap-sm mt"><button className="btn btn-primary btn-sm" disabled={p.stock <= 0} onClick={() => addToCart(p)}>+ Add</button><button className="btn btn-ghost btn-sm" onClick={() => toggle(items.find((i) => i.id === p.id))}>Remove</button></div>
            </th>))}</tr></thead>
          <tbody>{rows.map(([t, fn]) => <tr key={t}><td>{t}</td>{full.map((p) => <td key={p.id}>{fn(p)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
