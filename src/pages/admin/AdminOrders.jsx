import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money, dateOnly, dateTime } from '../../utils/format'
import { Badge, Empty, Spinner, ErrorBox, Modal, Field } from '../../components/ui'
import { usePagedList, ListState, Select } from '../../components/admin/AdminBits'

export function AdminOrders() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [delayed, setDelayed] = useState(params.get('delayed') === 'true')
  const list = usePagedList(adminService.orders, { search, status, from, to, delayed })

  return (
    <>
      <div className="page-head"><div><h2>Order monitoring</h2><p>Watch every order. Farmers process their own orders; admin steps in only for disputes.</p></div></div>
      <div className="toolbar">
        <input className="input" placeholder="🔍 Order ID, customer or farmer" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onChange={setStatus} options={['PLACED', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']} all="All statuses" />
        <label className="row small gap-sm">From <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 150 }} /></label>
        <label className="row small gap-sm">To <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 150 }} /></label>
        <label className="row small gap-sm"><input type="checkbox" checked={delayed} onChange={(e) => setDelayed(e.target.checked)} /> ⏰ Delayed only</label>
      </div>
      <ListState list={list}>
        {list.data?.items.length === 0 ? <div className="card"><Empty icon="🧾" title="No orders found" /></div> : (
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th>Farmer</th><th>Amount</th><th>Payment</th><th>Status</th><th></th></tr></thead>
            <tbody>{list.data?.items.map((o) => (
              <tr key={o.id}><td><b>{o.orderCode}</b><div className="muted small">{dateOnly(o.createdAt)}</div></td><td>{o.customer.name}</td><td>{o.farmer.name}</td><td><b>{money(o.totalAmount)}</b></td>
                <td>{o.payment && <><span className="small">{o.payment.method}</span> <Badge status={o.payment.status} /></>}</td>
                <td><Badge status={o.status} />{o.delayed && <div className="badge b-red" style={{ marginTop: 4 }}>⏰ Delayed</div>}</td>
                <td><Link className="btn btn-outline btn-sm" to={'/admin/orders/' + o.id}>Details</Link></td></tr>))}</tbody>
          </table></div>)}
      </ListState>
    </>
  )
}

export function AdminOrderDetail() {
  const { id } = useParams()
  const { data: o, loading, error, reload } = useAsync(() => adminService.order(id), [id])
  const [note, setNote] = useState(null)
  const toast = useToast()
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />

  const saveNote = async () => {
    try { await adminService.orderNote(o.id, note); toast.success('Note added and both parties notified'); setNote(null); reload() } catch (e) { toast.error(e.message) }
  }
  return (
    <>
      <div className="page-head"><div><Link to="/admin/orders" className="muted small">← Orders</Link><h2>{o.orderCode}</h2><p>Placed {dateTime(o.createdAt)}</p></div>
        <div className="row"><Badge status={o.status} />{o.delayed && <span className="badge b-red">⏰ Delayed</span>}<button className="btn btn-outline btn-sm" onClick={() => setNote('')}>📝 Add dispute note</button></div></div>
      {o.status === 'CANCELLED' && <div className="alert alert-error"><b>Cancellation details:</b> by {o.cancelledBy?.toLowerCase()} — {o.cancelReason}</div>}
      <div className="two-col" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div>
          <div className="card mb"><h3>Items</h3>{o.items.map((i) => <div className="list-item" key={i.id}><div className="grow"><b>{i.name}</b><div className="muted small">{money(i.price)} × {i.quantity} {i.unit}</div></div><b>{money(i.subtotal)}</b></div>)}
            <div className="row between mt"><b>Total</b><b className="pprice">{money(o.totalAmount)}</b></div></div>
          <div className="card mb"><h3>Order & payment history</h3>
            <ul className="timeline">{[...o.timeline].reverse().map((t, k) => <li key={k} className={t.type === 'PAYMENT' ? 'pay' : t.type === 'NOTE' ? 'note' : t.status === 'CANCELLED' ? 'bad' : ''}><b>{t.type === 'NOTE' ? 'Admin note' : (t.type === 'PAYMENT' ? 'Payment ' : 'Order ') + t.status.toLowerCase()}</b><div className="muted small">{dateTime(t.at)} · {t.by.toLowerCase()}</div>{t.note && <div className="soft small">{t.note}</div>}</li>)}</ul></div>
          {o.complaints.length > 0 && <div className="card"><h3>Disputes / complaints</h3>{o.complaints.map((c) => <div className="list-item" key={c.id}><div className="grow"><b>{c.subject}</b><div className="muted small">{c.complaintCode}</div></div><Badge status={c.status} /><Link to={'/admin/complaints?search=' + c.complaintCode} className="btn btn-ghost btn-sm">Open</Link></div>)}</div>}
        </div>
        <div>
          <div className="card mb"><h3>Customer</h3><b>{o.customer.name}</b><p className="soft small">{o.customer.userCode} · {o.customer.email}<br />📞 {o.customer.phone || '-'}</p></div>
          <div className="card mb"><h3>Farmer</h3><b>{o.farmer.name}</b><p className="soft small">{o.farmer.userCode}<br />📍 {o.farmer.location}{o.farmer.state ? ', ' + o.farmer.state : ''}</p></div>
          <div className="card mb"><h3>Delivery address</h3><p className="soft small">{o.shipping.name}<br />{o.shipping.address}<br />{o.shipping.city}, {o.shipping.state} - {o.shipping.pincode}</p></div>
          <div className="card"><h3>Payment (simulated)</h3><div className="row between"><span>{o.payment?.method}</span><Badge status={o.payment?.status} /></div><p className="muted small mt">{o.payment?.code} {o.payment?.transactionRef && '· ' + o.payment.transactionRef}</p></div>
        </div>
      </div>
      {note !== null && <Modal title="Add dispute note" size="sm" onClose={() => setNote(null)} footer={<><button className="btn btn-ghost" onClick={() => setNote(null)}>Cancel</button><button className="btn btn-primary" disabled={!note.trim()} onClick={saveNote}>Save note</button></>}>
        <Field label="Note (visible in the timeline; customer and farmer are notified)"><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field></Modal>}
    </>
  )
}
