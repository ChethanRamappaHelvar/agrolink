import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { farmerService } from '../../services/farmerService'
import { money, dateOnly } from '../../utils/format'
import { Badge, Empty, Pagination, Spinner, ErrorBox } from '../../components/ui'

const STATUSES = ['', 'PLACED', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function FarmerOrders() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { const t = setTimeout(() => { setQ(search); setPage(0) }, 350); return () => clearTimeout(t) }, [search])
  useEffect(() => {
    setData(null); setError('')
    farmerService.orders({ status, search: q, page, size: 10 }).then(setData).catch((e) => setError(e.message))
  }, [status, q, page])

  return (
    <>
      <div className="page-head"><div><h2>Customer orders</h2><p>Accept, process and deliver the orders placed for your products.</p></div></div>
      <div className="toolbar">
        <input className="input" placeholder="🔍 Order ID or customer name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="chip-list">{STATUSES.map((s) => <button key={s} className={'chip' + (status === s ? ' on' : '')} onClick={() => { setStatus(s); setPage(0) }}>{s || 'All'}</button>)}</div>
      </div>
      <ErrorBox message={error} />
      {!data && !error ? <Spinner /> : data && (data.items.length === 0 ? <div className="card"><Empty icon="🧾" title="No orders found" /></div> : (
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>{data.items.map((o) => (
            <tr key={o.id}><td><b>{o.orderCode}</b><div className="muted small">{dateOnly(o.createdAt)}</div></td><td>{o.customer.name}<div className="muted small">{o.shipping.city}</div></td>
              <td className="small">{o.items.map((i) => i.name + ' ×' + i.quantity).join(', ')}</td><td><b>{money(o.totalAmount)}</b></td>
              <td>{o.payment && <><div className="small">{o.payment.method}</div><Badge status={o.payment.status} /></>}</td><td><Badge status={o.status} /></td>
              <td><Link className="btn btn-outline btn-sm" to={'/farmer/orders/' + o.id}>{o.status === 'PLACED' ? 'Review' : 'View'}</Link></td></tr>))}</tbody>
        </table></div>))}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  )
}
