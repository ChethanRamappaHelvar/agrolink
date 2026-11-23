import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buyerService } from '../../services/buyerService'
import { useBuyer } from '../../context/BuyerContext'
import { useToast } from '../../context/ToastContext'
import { money } from '../../utils/format'
import { Spinner, Empty, ErrorBox } from '../../components/ui'
import AddressForm from '../../components/AddressForm'

const METHODS = [['COD', '💵', 'Cash on delivery', 'Pay when you receive'], ['UPI', '📱', 'UPI (simulated)', 'Instant demo payment'], ['CARD', '💳', 'Card (simulated)', 'Instant demo payment']]

export default function Checkout() {
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState(null)
  const [method, setMethod] = useState('COD')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [offers, setOffers] = useState([])
  const [codeText, setCodeText] = useState('')
  const [applied, setApplied] = useState(null)      // { code, discount, payable } from /coupons/check
  const [couponMsg, setCouponMsg] = useState('')
  // one key per checkout page: if the buyer double-clicks, the server ignores the duplicate order
  const requestKey = useRef(crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random())
  const navigate = useNavigate()
  const toast = useToast()
  const { reload } = useBuyer()

  const load = async () => {
    const [c, a] = await Promise.all([buyerService.cart(), buyerService.addresses()])
    setCart(c); setAddresses(a)
    setAddressId((cur) => cur || a.find((x) => x.defaultAddress)?.id || a[0]?.id || null)
  }
  useEffect(() => { load().catch((e) => setError(e.message)); buyerService.coupons().then(setOffers).catch(() => {}) }, [])

  const applyCoupon = async (code) => {
    setCouponMsg('')
    try { const r = await buyerService.checkCoupon(code); setApplied(r); setCodeText(''); toast.success(r.code + ' applied') } catch (e) { setApplied(null); setCouponMsg(e.message) }
  }

  const place = async () => {
    setError('')
    if (!addressId) return setError('Please select or add a delivery address')
    setBusy(true)
    try {
      const orders = await buyerService.checkout({ addressId, paymentMethod: method, requestKey: requestKey.current, couponCode: applied ? applied.code : null })
      toast.success(orders.length > 1 ? orders.length + ' orders placed (one per farmer)!' : 'Order placed successfully!')
      reload()
      navigate(orders.length === 1 ? '/buyer/orders/' + orders[0].id : '/buyer/orders')
    } catch (e) { setError(e.message); setBusy(false) }
  }

  if (!cart) return error ? <ErrorBox message={error} /> : <Spinner />
  if (cart.items.length === 0) return <div className="card"><Empty icon="🛒" title="Nothing to checkout"><Link to="/marketplace" className="btn btn-primary">Browse products</Link></Empty></div>

  return (
    <>
      <div className="page-head"><div><h2>Checkout</h2><p>Review your order and choose how to pay.</p></div></div>
      <ErrorBox message={error} />
      <div className="two-col" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div>
          <div className="card mb">
            <div className="row between"><h3>1. Delivery address</h3><button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}>+ New address</button></div>
            {addresses.length === 0 && <p className="muted">You have no saved address. Add one to continue.</p>}
            {addresses.map((a) => (
              <label key={a.id} className="list-item" style={{ cursor: 'pointer', background: addressId === a.id ? 'var(--surface-2)' : '', padding: 14, borderRadius: 10, border: '1.5px solid ' + (addressId === a.id ? 'var(--accent)' : 'var(--line)'), marginBottom: 10 }}>
                <input type="radio" name="addr" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                <div><b>{a.fullName}</b> <span className="badge b-gray">{a.label}</span>{a.defaultAddress && <span className="badge b-green" style={{ marginLeft: 6 }}>Default</span>}
                  <div className="soft small">{a.line1}{a.line2 ? ', ' + a.line2 : ''}, {a.city}, {a.state} - {a.pincode} · 📞 {a.phone}</div></div>
              </label>
            ))}
          </div>
          <div className="card">
            <h3>2. Payment method</h3>
            <div className="row" style={{ alignItems: 'stretch' }}>
              {METHODS.map(([k, ic, t, d]) => (
                <label key={k} className="card-flat grow" style={{ padding: 16, cursor: 'pointer', minWidth: 160, borderColor: method === k ? 'var(--accent)' : '', background: method === k ? 'var(--surface-2)' : '' }}>
                  <input type="radio" name="pay" checked={method === k} onChange={() => setMethod(k)} /> <span style={{ fontSize: '1.4rem' }}>{ic}</span>
                  <div className="bold">{t}</div><div className="muted small">{d}</div>
                </label>
              ))}
            </div>
            <p className="muted small mt">This is a demo store: no real money is charged and no payment gateway is used.</p>
          </div>
        </div>
        <div className="card">
          <h3>Order summary</h3>
          {cart.items.map((i) => <div className="row between small mb" key={i.id}><span>{i.name} × {i.quantity}</span><b>{money(i.lineTotal)}</b></div>)}
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '14px 0' }} />
          {applied ? (
            <div className="coupon-applied mb"><span>🎟️ {applied.code} applied</span><button className="btn btn-ghost btn-sm" onClick={() => setApplied(null)}>Remove</button></div>
          ) : (
            <div className="mb">
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <input className="input" placeholder="Have a coupon code?" value={codeText} onChange={(e) => setCodeText(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && codeText && applyCoupon(codeText)} />
                <button className="btn btn-outline" disabled={!codeText.trim()} onClick={() => applyCoupon(codeText)}>Apply</button>
              </div>
              {couponMsg && <p className="small mt" style={{ color: 'var(--rose)' }}>{couponMsg}</p>}
              {offers.length > 0 && <div className="mt">{offers.slice(0, 3).map((o) => (
                <div className="coupon-ticket" key={o.code}><div className="code">{o.code}</div><div className="info"><b className="small">{o.discountType === 'PERCENT' ? o.discountValue + '% off' : money(o.discountValue) + ' off'}</b><div className="muted small">{o.description}{o.minOrderAmount > 0 ? ' · min ' + money(o.minOrderAmount) : ''}</div></div>
                  <div className="act"><button className="btn btn-primary btn-sm" onClick={() => applyCoupon(o.code)}>Use</button></div></div>))}</div>}
            </div>)}
          <div className="sum-line"><span>Subtotal</span><span>{money(cart.total)}</span></div>
          {applied && <div className="sum-line disc"><span>Coupon discount</span><span>− {money(applied.discount)}</span></div>}
          <div className="row between"><b>Total payable</b><b className="pprice">{money(applied ? applied.payable : cart.total)}</b></div>
          <button className="btn btn-primary btn-block mt" disabled={busy || !cart.allAvailable} onClick={place}>{busy ? 'Placing order...' : 'Place order'}</button>
          <Link to="/buyer/cart" className="btn btn-ghost btn-block mt">← Back to cart</Link>
        </div>
      </div>
      {showForm && <AddressForm onClose={() => setShowForm(false)} onSaved={(a) => { setShowForm(false); setAddressId(a.id); load() }} />}
    </>
  )
}
