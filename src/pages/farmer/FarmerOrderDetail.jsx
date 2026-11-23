import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money, dateTime } from '../../utils/format'
import { Badge, Spinner, ErrorBox, ConfirmDialog } from '../../components/ui'

// what the farmer can do next from each status
const NEXT = { ACCEPTED: ['PROCESSING', 'Start processing'], PROCESSING: ['SHIPPED', 'Mark as shipped'], SHIPPED: ['DELIVERED', 'Mark as delivered'] }

export default function FarmerOrderDetail() {
  const { id } = useParams()
  const { data: o, loading, error, setData } = useAsync(() => farmerService.order(id), [id])
  const [reject, setReject] = useState(false)
  const toast = useToast()

  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />

  const change = async (status, note) => {
    try { setData(await farmerService.updateOrderStatus(o.id, status, note)); toast.success('Order is now ' + status.toLowerCase()); setReject(false) } catch (e) { toast.error(e.message) }
  }
  const next = NEXT[o.status]

  return (
    <>
      <div className="page-head">
        <div><Link to="/farmer/orders" className="muted small">← Orders</Link><h2>{o.orderCode}</h2><p>Placed on {dateTime(o.createdAt)}</p></div>
        <div className="row"><Badge status={o.status} />
          {o.status === 'PLACED' && <><button className="btn btn-primary" onClick={() => change('ACCEPTED')}>✓ Accept order</button><button className="btn btn-danger-outline" onClick={() => setReject(true)}>Reject</button></>}
          {next && <><button className="btn btn-primary" onClick={() => change(next[0])}>{next[1]}</button>{o.status === 'ACCEPTED' && <button className="btn btn-danger-outline" onClick={() => setReject(true)}>Cancel order</button>}</>}
        </div>
      </div>
      {o.status === 'CANCELLED' && <div className="alert alert-error">Cancelled by {o.cancelledBy?.toLowerCase()}. Reason: {o.cancelReason}</div>}
      <div className="two-col" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div>
          <div className="card mb"><h3>Items to deliver</h3>
            {o.items.map((i) => <div className="list-item" key={i.id}><div className="grow"><b>{i.name}</b><div className="muted small">{money(i.price)} × {i.quantity} {i.unit}</div></div><b>{money(i.subtotal)}</b></div>)}
            <div className="row between mt"><b>Order total</b><b className="pprice">{money(o.totalAmount)}</b></div></div>
          <div className="card"><h3>Order status history</h3>
            <ul className="timeline">{[...o.timeline].reverse().map((t, k) => (
              <li key={k} className={t.type === 'PAYMENT' ? 'pay' : t.status === 'CANCELLED' ? 'bad' : ''}><b>{t.type === 'PAYMENT' ? 'Payment ' : 'Order '}{t.status.toLowerCase()}</b>
                <div className="muted small">{dateTime(t.at)} · {t.by.toLowerCase()}</div>{t.note && <div className="soft small">{t.note}</div>}</li>))}</ul></div>
        </div>
        <div>
          <div className="card mb"><h3>Customer</h3><b>{o.customer.name}</b><p className="soft small">{o.customer.email}<br />📞 {o.customer.phone || o.shipping.phone}</p></div>
          <div className="card mb"><h3>Delivery address</h3><b>{o.shipping.name}</b><p className="soft small">{o.shipping.address}<br />{o.shipping.city}, {o.shipping.state} - {o.shipping.pincode}<br />📞 {o.shipping.phone}</p></div>
          <div className="card"><h3>Payment</h3><div className="row between"><span>{o.payment?.method}</span><Badge status={o.payment?.status} /></div>
            {o.payment?.method === 'COD' && o.payment.status === 'PENDING' && <p className="muted small mt">Collect {money(o.totalAmount)} in cash on delivery.</p>}</div>
        </div>
      </div>
      {reject && <ConfirmDialog title={o.status === 'PLACED' ? 'Reject this order?' : 'Cancel this order?'} message="The customer is notified and the stock is returned to your inventory." danger askReason reasonLabel="Reason for the customer" confirmText="Yes, cancel" onConfirm={(r) => change('CANCELLED', r)} onClose={() => setReject(false)} />}
    </>
  )
}
