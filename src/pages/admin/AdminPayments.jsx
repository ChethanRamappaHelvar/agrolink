import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'
import { money, dateTime } from '../../utils/format'
import { Badge, Empty, Stat } from '../../components/ui'
import { usePagedList, ListState, Select } from '../../components/admin/AdminBits'

export default function AdminPayments() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const list = usePagedList(adminService.payments, { search, status, from, to })
  const s = list.data?.summary
  const page = list.data?.page
  const shaped = { ...list, data: page }     // the API returns { page, summary }

  return (
    <>
      <div className="page-head"><div><h2>Payments</h2><p>Simulated payment records. No real payment gateway is connected.</p></div></div>
      {s && <div className="stat-grid">
        <Stat icon="✅" value={money(s.completedAmount)} text="Completed payments" tone="green" />
        <Stat icon="⏳" value={money(s.pendingAmount)} text="Pending (COD)" tone="amber" />
        <Stat icon="↩️" value={money(s.refundedAmount)} text="Refunded" tone="purple" />
        <Stat icon="⚠️" value={s.failedOrCancelled} text="Failed / cancelled" tone="red" /></div>}
      <div className="toolbar">
        <input className="input" placeholder="🔍 Order, payment ID or customer" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onChange={setStatus} options={['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']} all="All statuses" />
        <label className="row small gap-sm">From <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 150 }} /></label>
        <label className="row small gap-sm">To <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 150 }} /></label>
      </div>
      <ListState list={shaped}>
        {page?.items.length === 0 ? <div className="card"><Empty icon="💳" title="No payments found" /></div> : (
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th>Payment</th><th>Order</th><th>Customer → Farmer</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{page?.items.map((p) => (
              <tr key={p.id}><td><b>{p.paymentCode}</b><div className="muted small">{dateTime(p.createdAt)}</div></td><td><Link to={'/admin/orders/' + p.orderId} style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{p.orderCode}</Link><div><Badge status={p.orderStatus} /></div></td>
                <td>{p.customerName}<div className="muted small">→ {p.farmerName}</div></td><td>{p.method}<div className="muted small">{p.transactionRef}</div></td><td><b>{money(p.amount)}</b></td><td><Badge status={p.status} /></td></tr>))}</tbody>
          </table></div>)}
      </ListState>
    </>
  )
}
