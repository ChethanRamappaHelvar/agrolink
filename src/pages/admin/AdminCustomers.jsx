import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money, dateOnly, dateTime } from '../../utils/format'
import { Badge, Empty, Spinner, ErrorBox, ConfirmDialog, Stars } from '../../components/ui'
import { usePagedList, ListState, Select } from '../../components/admin/AdminBits'

export function AdminCustomers() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')
  const [status, setStatus] = useState('')
  const [suspicious, setSuspicious] = useState(false)
  const [act, setAct] = useState(null)
  const toast = useToast()
  const list = usePagedList(adminService.customers, { search, status, suspicious })

  const confirm = async () => {
    try { await adminService.customerStatus(act.c.userId, act.value); toast.success('Customer updated'); setAct(null); list.reload() } catch (e) { toast.error(e.message); setAct(null) }
  }
  return (
    <>
      <div className="page-head"><div><h2>Customer management</h2><p>Monitor customer accounts and suspicious activity.</p></div></div>
      <div className="toolbar">
        <input className="input" placeholder="🔍 Name, email or ID (CUS-00001)" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onChange={setStatus} options={['ACTIVE', 'INACTIVE']} all="All accounts" />
        <label className="row small gap-sm"><input type="checkbox" checked={suspicious} onChange={(e) => setSuspicious(e.target.checked)} /> ⚠️ Suspicious only</label>
      </div>
      <ListState list={list}>
        {list.data?.items.length === 0 ? <div className="card"><Empty icon="🛍️" title="No customers found" /></div> : (
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th>Customer</th><th>Orders</th><th>Cancelled</th><th>Spent</th><th>Complaints</th><th>Account</th><th></th></tr></thead>
            <tbody>{list.data?.items.map((c) => (
              <tr key={c.id}><td><b>{c.name}</b><div className="muted small">{c.userCode} · {c.email}</div>{c.flags.map((f) => <div key={f} className="badge b-red" style={{ marginTop: 4 }}>⚠ {f}</div>)}</td>
                <td>{c.orderCount}</td><td>{c.cancelledOrders}</td><td>{money(c.totalSpent)}</td><td>{c.complaintCount}</td><td><Badge status={c.status} /></td>
                <td><div className="row gap-sm" style={{ flexWrap: 'nowrap' }}><Link to={'/admin/customers/' + c.id} className="btn btn-outline btn-sm">View</Link>
                  <button className={'btn btn-sm ' + (c.status === 'ACTIVE' ? 'btn-danger-outline' : 'btn-outline')} onClick={() => setAct({ c, value: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}>{c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></div></td></tr>))}</tbody>
          </table></div>)}
      </ListState>
      {act && <ConfirmDialog title={act.value === 'ACTIVE' ? 'Activate customer?' : 'Deactivate customer?'} message={act.c.name + ' (' + act.c.userCode + ')'} danger={act.value === 'INACTIVE'} onConfirm={confirm} onClose={() => setAct(null)} />}
    </>
  )
}

export function AdminCustomerDetail() {
  const { id } = useParams()
  const { data: c, loading, error } = useAsync(() => adminService.customer(id), [id])
  const [tab, setTab] = useState('orders')
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />
  return (
    <>
      <div className="page-head"><div><Link to="/admin/customers" className="muted small">← Customers</Link><h2>{c.name}</h2><p>{c.userCode} · {c.email} · 📞 {c.phone || '-'} · Joined {dateOnly(c.createdAt)}</p></div><Badge status={c.status} /></div>
      {c.flags.length > 0 && <div className="alert alert-error"><b>Suspicious activity:</b> {c.flags.join(' · ')}</div>}
      <div className="stat-grid">
        <div className="stat"><div className="ico ico-blue">🧾</div><div><b>{c.orderCount}</b><span>Orders</span></div></div>
        <div className="stat"><div className="ico ico-red">❌</div><div><b>{c.cancelledOrders}</b><span>Cancelled</span></div></div>
        <div className="stat"><div className="ico ico-purple">💰</div><div><b>{money(c.totalSpent)}</b><span>Spent</span></div></div>
        <div className="stat"><div className="ico ico-amber">⭐</div><div><b>{c.reviews.length}</b><span>Reviews</span></div></div>
      </div>
      <div className="tabs">{[['orders', 'Order history'], ['reviews', 'Reviews'], ['complaints', 'Complaints']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</div>
      {tab === 'orders' && (c.orders.length === 0 ? <p className="muted">No orders.</p> : <div className="table-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Farmer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>{c.orders.map((o) => <tr key={o.id}><td><Link to={'/admin/orders/' + o.id} style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{o.orderCode}</Link></td><td>{o.farmer.name}</td><td>{money(o.totalAmount)}</td><td>{dateOnly(o.createdAt)}</td><td><Badge status={o.status} /></td></tr>)}</tbody></table></div>)}
      {tab === 'reviews' && (c.reviews.length === 0 ? <p className="muted">No reviews.</p> : c.reviews.map((r) => <div className="card mb" key={r.id}><div className="row between"><b>{r.productName}</b><Stars value={r.rating} /></div><p className="soft">{r.comment}</p></div>))}
      {tab === 'complaints' && (c.complaints.length === 0 ? <p className="muted">No complaints.</p> : c.complaints.map((x) => <div className="card mb" key={x.id}><div className="row between"><b>{x.subject}</b><Badge status={x.status} /></div><p className="soft small">{x.complaintCode} · {dateTime(x.createdAt)}</p><p className="soft">{x.description}</p></div>))}
    </>
  )
}
