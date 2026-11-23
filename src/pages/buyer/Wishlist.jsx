import { Link } from 'react-router-dom'
import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { useBuyer } from '../../context/BuyerContext'
import { useToast } from '../../context/ToastContext'
import { imageSrc } from '../../services/api'
import { money, emojiFor } from '../../utils/format'
import { Empty, Spinner } from '../../components/ui'

export default function Wishlist() {
  const { data, loading, reload } = useAsync(() => buyerService.wishlist(), [])
  const buyer = useBuyer()
  const toast = useToast()

  const remove = async (p) => { await buyerService.removeWish(p.id); toast.success('Removed from wishlist'); reload(); buyer.reload() }
  const move = async (p) => {
    try { await buyerService.moveToCart(p.id); toast.success(p.name + ' moved to cart'); reload(); buyer.reload() } catch (e) { toast.error(e.message) }
  }

  if (loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><h2>My wishlist</h2><p>{data.length} saved product(s)</p></div></div>
      {data.length === 0 ? <div className="card"><Empty icon="❤️" title="No saved products" text="Tap the heart on any product to save it here."><Link to="/marketplace" className="btn btn-primary">Explore products</Link></Empty></div> : (
        <div className="product-grid">
          {data.map((p) => (
            <div className="pcard" key={p.id}>
              <Link to={'/product/' + p.id}><div className="pimg">{p.imageUrl ? <img src={imageSrc(p.imageUrl)} alt="" /> : emojiFor(p)}</div></Link>
              <div className="pbody">
                <b>{p.name}</b><span className="muted small">👨‍🌾 {p.farmerName}</span>
                <div className="pprice">{money(p.price)} <small>/ {p.unit}</small></div>
                {!p.purchasable && <span className="badge b-red">{p.stock <= 0 ? 'Out of stock' : 'Unavailable'}</span>}
                <div className="row mt" style={{ marginTop: 'auto' }}>
                  <button className="btn btn-primary btn-sm grow" disabled={!p.purchasable} onClick={() => move(p)}>Move to cart</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(p)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
