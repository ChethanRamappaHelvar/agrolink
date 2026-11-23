import { Link, useNavigate } from 'react-router-dom'
import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { useBuyer } from '../../context/BuyerContext'
import { useToast } from '../../context/ToastContext'
import { imageSrc } from '../../services/api'
import { money } from '../../utils/format'
import { Empty, Spinner, ErrorBox } from '../../components/ui'

export default function Cart() {
  const { data: cart, loading, error, setData } = useAsync(() => buyerService.cart(), [])
  const { reload } = useBuyer()
  const toast = useToast()
  const navigate = useNavigate()

  const run = async (fn) => {
    try { setData(await fn()); reload() } catch (e) { toast.error(e.message) }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />
  if (cart.items.length === 0) return <div className="card"><Empty icon="🛒" title="Your cart is empty" text="Add some fresh produce to get started."><Link to="/marketplace" className="btn btn-primary">Go to marketplace</Link></Empty></div>

  return (
    <>
      <div className="page-head"><div><h2>Shopping cart</h2><p>{cart.itemCount} product(s)</p></div></div>
      <div className="two-col" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start' }}>
        <div className="card" style={{ padding: '6px 22px' }}>
          {cart.items.map((i) => (
            <div className="list-item" key={i.id} style={{ alignItems: 'flex-start' }}>
              <Link to={'/product/' + i.productId} className="pimg" style={{ width: 84, height: 84, borderRadius: 12, fontSize: '2.2rem', flexShrink: 0 }}>
                {i.imageUrl ? <img src={imageSrc(i.imageUrl)} alt="" /> : i.categoryIcon || '🌿'}
              </Link>
              <div className="grow">
                <Link to={'/product/' + i.productId}><b>{i.name}</b></Link>
                <div className="muted small">👨‍🌾 {i.farmerName} · {money(i.price)} / {i.unit}</div>
                {i.issue && <div className="badge b-red" style={{ marginTop: 6 }}>{i.issue}</div>}
                <div className="row mt" style={{ gap: 14 }}>
                  <div className="qty">
                    <button disabled={i.quantity <= 1} onClick={() => run(() => buyerService.updateCartItem(i.id, i.quantity - 1))}>−</button>
                    <span>{i.quantity}</span>
                    <button disabled={i.quantity >= i.stock} onClick={() => run(() => buyerService.updateCartItem(i.id, i.quantity + 1))}>+</button>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => run(() => buyerService.removeCartItem(i.id))}>🗑 Remove</button>
                </div>
              </div>
              <b>{money(i.lineTotal)}</b>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>Order summary</h3>
          <div className="row between"><span className="soft">Items ({cart.units})</span><b>{money(cart.total)}</b></div>
          <div className="row between mt"><span className="soft">Delivery</span><b style={{ color: 'var(--primary)' }}>FREE</b></div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '16px 0' }} />
          <div className="row between"><b>Total</b><b className="pprice">{money(cart.total)}</b></div>
          {!cart.allAvailable && <div className="alert alert-warn mt">Some items need attention. Please fix them before checkout.</div>}
          <button className="btn btn-primary btn-block mt" disabled={!cart.allAvailable} onClick={() => navigate('/buyer/checkout')}>Proceed to checkout →</button>
          <Link to="/marketplace" className="btn btn-ghost btn-block mt">Continue shopping</Link>
        </div>
      </div>
    </>
  )
}
