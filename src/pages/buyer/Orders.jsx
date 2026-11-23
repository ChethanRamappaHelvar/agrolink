import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { money, dateOnly } from '../../utils/format'
import { Badge, Empty, Pagination, Spinner, ErrorBox } from '../../components/ui'

const STATUSES = ['', 'PLACED', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function Orders() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const { data, loading, error } = useAsync(() => buyerService.orders({ status, page, size: 8 }), [status, page])

  return (
    <>
      <div className="page-head"><div><h2>My orders</h2><p>Track and manage everything you ordered.</p></div></div>
      <div className="chip-list mb">
        {STATUSES.map((s) => <button key={s} className={'chip' + (status === s ? ' on' : '')} onClick={() => { setStatus(s); setPage(0) }}>{s || 'All'}</button>)}
      </div>
      <ErrorBox message={error} />
      {loading ? <Spinner /> : data.items.length === 0 ? <div className="card"><Empty icon="📦" title="No orders found"><Link to="/marketplace" className="btn btn-primary">Start shopping</Link></Empty></div> : (
        <div className="grid" style={{ display: 'grid', gap: 14 }}>
          {data.items.map((o) => (
            <Link to={'/buyer/orders/' + o.id} className="card" key={o.id}>
              <div className="row between">
                <div><b>{o.orderCode}</b><div className="muted small">Placed {dateOnly(o.createdAt)} · Sold by {o.farmer.name}</div></div>
                <div className="row"><Badge status={o.status} /><b className="pprice" style={{ fontSize: '1.15rem' }}>{money(o.totalAmount)}</b></div>
              </div>
              <div className="soft small mt">{o.items.map((i) => i.name + ' × ' + i.quantity).join(', ')}</div>
            </Link>
          ))}
        </div>
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  )
}
