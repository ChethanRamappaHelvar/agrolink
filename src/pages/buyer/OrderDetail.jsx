import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBuyer } from '../../context/BuyerContext'
import { reorderItems } from '../../utils/reorder'
import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money, dateTime } from '../../utils/format'
import { Badge, Spinner, ErrorBox, Modal, ConfirmDialog, RatingInput, Field } from '../../components/ui'
import Invoice from '../../components/Invoice'

const FLOW = ['PLACED', 'ACCEPTED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const ICONS = { PLACED: '🛒', ACCEPTED: '👍', PROCESSING: '📦', SHIPPED: '🚚', DELIVERED: '🏠' }

export default function OrderDetail() {
  const { id } = useParams()
  const { data: o, loading, error, reload, setData } = useAsync(() => buyerService.order(id), [id])
  const toast = useToast()
  const navigate = useNavigate()
  const { reload: reloadCart } = useBuyer()
  const [invoice, setInvoice] = useState(null)
  const [cancel, setCancel] = useState(false)
  const [review, setReview] = useState(null)
  const [complaint, setComplaint] = useState(false)

  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />

  const cancelled = o.status === 'CANCELLED'
  const reached = FLOW.indexOf(o.status)
  const canCancel = o.status === 'PLACED' || o.status === 'ACCEPTED'

  const reorder = async () => { const r = await reorderItems(o.items); toast[r.added ? 'success' : 'error'](r.msg); if (r.added) { reloadCart(); navigate('/buyer/cart') } }
  const showInvoice = async () => { try { setInvoice(await buyerService.invoice(o.id)) } catch (e) { toast.error(e.message) } }
  const doCancel = async (reason) => {
    try { setData(await buyerService.cancelOrder(o.id, reason)); toast.success('Order cancelled'); setCancel(false) } catch (e) { toast.error(e.message) }
  }

  return (
    <>
      <div className="page-head">
        <div><Link to="/buyer/orders" className="muted small">← All orders</Link><h2>{o.orderCode}</h2><p>Placed on {dateTime(o.createdAt)}</p></div>
        <div className="row">
          <Badge status={o.status} />
          <button className="btn btn-outline btn-sm" onClick={reorder}>🔁 Reorder</button>
          <button className="btn btn-outline btn-sm" onClick={showInvoice}>🧾 Invoice</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setComplaint(true)}>Report a problem</button>
          {canCancel && <button className="btn btn-danger-outline btn-sm" onClick={() => setCancel(true)}>Cancel order</button>}
        </div>
      </div>

      <div className="card mb">
        {cancelled ? (
          <div className="alert alert-error" style={{ margin: 0 }}>This order was cancelled{o.cancelledBy ? ' by ' + o.cancelledBy.toLowerCase() : ''}. Reason: {o.cancelReason}</div>
        ) : (
          <div className="track">{FLOW.map((s, i) => <div key={s} className={'st' + (i <= reached ? ' done' : '')}><i>{i <= reached ? '✓' : ICONS[s]}</i>{s[0] + s.slice(1).toLowerCase()}</div>)}</div>
        )}
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div>
          <div className="card mb">
            <h3>Items</h3>
            {o.items.map((i) => (
              <div className="list-item" key={i.id}>
                <div className="grow"><Link to={'/product/' + i.productId}><b>{i.name}</b></Link><div className="muted small">{money(i.price)} × {i.quantity} {i.unit}</div></div>
                <b>{money(i.subtotal)}</b>
                {o.status === 'DELIVERED' && <button className="btn btn-amber btn-sm" onClick={() => setReview(i)}>⭐ Review</button>}
              </div>))}
            {Number(o.discountAmount) > 0 && <div className="sum-line disc mt"><span>Coupon {o.couponCode}</span><span>− {money(o.discountAmount)}</span></div>}
            <div className="row between mt"><b>Total paid</b><b className="pprice">{money(o.totalAmount)}</b></div>
          </div>
          <div className="card">
            <h3>Order timeline</h3>
            <ul className="timeline">
              {[...o.timeline].reverse().map((t, idx) => (
                <li key={idx} className={t.type === 'PAYMENT' ? 'pay' : t.status === 'CANCELLED' ? 'bad' : ''}>
                  <b>{t.type === 'PAYMENT' ? 'Payment ' : 'Order '}{t.status.toLowerCase()}</b>
                  <div className="muted small">{dateTime(t.at)} · by {t.by.toLowerCase()}</div>
                  {t.note && <div className="soft small">{t.note}</div>}
                </li>))}
            </ul>
          </div>
        </div>
        <div>
          <div className="card mb"><h3>Delivery address</h3><b>{o.shipping.name}</b><p className="soft small">{o.shipping.address}<br />{o.shipping.city}, {o.shipping.state} - {o.shipping.pincode}<br />📞 {o.shipping.phone}</p></div>
          <div className="card mb"><h3>Payment</h3><div className="row between"><span>{o.payment?.method}</span><Badge status={o.payment?.status} /></div>{o.payment?.transactionRef && <p className="muted small mt">Ref: {o.payment.transactionRef}</p>}</div>
          <div className="card"><h3>Sold by</h3><b>👨‍🌾 {o.farmer.name}</b><p className="soft small">📍 {o.farmer.location}{o.farmer.state ? ', ' + o.farmer.state : ''}</p></div>
        </div>
      </div>

      {invoice && (
        <Modal title="Invoice" size="lg" onClose={() => setInvoice(null)} footer={<><button className="btn btn-ghost" onClick={() => setInvoice(null)}>Close</button><button className="btn btn-primary no-print" onClick={() => window.print()}>🖨 Print / Save PDF</button></>}>
          <Invoice data={invoice} />
        </Modal>)}
      {cancel && <ConfirmDialog title="Cancel this order?" message="The reserved stock is released back to the farmer. This cannot be undone." danger askReason confirmText="Yes, cancel order" onConfirm={doCancel} onClose={() => setCancel(false)} />}
      {review && <ReviewModal item={review} onClose={() => setReview(null)} />}
      {complaint && <ComplaintModal order={o} onClose={() => setComplaint(false)} />}
    </>
  )
}

function ReviewModal({ item, onClose }) {
  const toast = useToast()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [err, setErr] = useState('')
  const save = async () => {
    try { await buyerService.createReview({ productId: item.productId, rating, comment }); toast.success('Thanks for your review!'); onClose() } catch (e) { setErr(e.message) }
  }
  return (
    <Modal title={'Review ' + item.name} size="sm" onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Submit review</button></>}>
      <ErrorBox message={err} />
      <Field label="Your rating"><RatingInput value={rating} onChange={setRating} /></Field>
      <Field label="Your review"><textarea className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the quality and freshness?" maxLength={1000} /></Field>
    </Modal>
  )
}

function ComplaintModal({ order, onClose }) {
  const toast = useToast()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [err, setErr] = useState('')
  const save = async () => {
    if (!subject.trim() || !description.trim()) return setErr('Please fill the subject and description')
    try { await buyerService.createComplaint({ orderId: order.id, subject, description }); toast.success('Complaint submitted. Our team will respond soon.'); onClose() } catch (e) { setErr(e.message) }
  }
  return (
    <Modal title={'Report a problem with ' + order.orderCode} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Submit</button></>}>
      <ErrorBox message={err} />
      <Field label="Subject"><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Damaged product" /></Field>
      <Field label="Describe the problem"><textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
    </Modal>
  )
}
