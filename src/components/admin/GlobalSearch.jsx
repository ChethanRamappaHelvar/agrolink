import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'

/** Search box in the admin top bar: finds farmers, customers, products, orders and complaints. */
export default function GlobalSearch() {
  const [q, setQ] = useState('')
  const [res, setRes] = useState(null)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return }
    const t = setTimeout(() => adminService.search(q.trim()).then((r) => { setRes(r); setOpen(true) }).catch(() => {}), 350)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (path) => { setOpen(false); setQ(''); navigate(path) }
  const empty = res && !res.people.length && !res.products.length && !res.orders.length && !res.complaints.length

  return (
    <div className="rel" ref={ref} style={{ flex: '0 1 340px', marginLeft: 16 }}>
      <input className="input" style={{ borderRadius: 999, padding: '8px 16px' }} placeholder="🔍 Search anything..." value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => res && setOpen(true)} />
      {open && res && (
        <div className="dropdown" style={{ left: 0, right: 'auto', width: 360, maxHeight: 420, overflow: 'auto', top: 46 }}>
          {empty && <div className="muted small" style={{ padding: 12 }}>No results for “{q}”</div>}
          {res.people.length > 0 && <div className="side-label" style={{ color: 'var(--muted)' }}>People</div>}
          {res.people.map((p) => <button key={'u' + p.id} onClick={() => go(p.role === 'FARMER' ? '/admin/farmers?search=' + encodeURIComponent(p.userCode) : '/admin/customers?search=' + encodeURIComponent(p.userCode))}>{p.role === 'FARMER' ? '👨‍🌾' : '🛍️'} {p.name} <span className="muted small">{p.userCode}</span></button>)}
          {res.products.length > 0 && <div className="side-label" style={{ color: 'var(--muted)' }}>Products</div>}
          {res.products.map((p) => <button key={'p' + p.id} onClick={() => go('/admin/products?search=' + encodeURIComponent(p.name))}>🥕 {p.name} <span className="muted small">{p.productCode}</span></button>)}
          {res.orders.length > 0 && <div className="side-label" style={{ color: 'var(--muted)' }}>Orders</div>}
          {res.orders.map((o) => <button key={'o' + o.id} onClick={() => go('/admin/orders/' + o.id)}>🧾 {o.orderCode}</button>)}
          {res.complaints.length > 0 && <div className="side-label" style={{ color: 'var(--muted)' }}>Complaints</div>}
          {res.complaints.map((c) => <button key={'c' + c.id} onClick={() => go('/admin/complaints?search=' + encodeURIComponent(c.complaintCode))}>🛠️ {c.subject} <span className="muted small">{c.complaintCode}</span></button>)}
        </div>
      )}
    </div>
  )
}
