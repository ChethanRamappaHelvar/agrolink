import { Link } from 'react-router-dom'
import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { useShopActions } from '../../hooks/useShopActions'
import { money, ago, dateOnly } from '../../utils/format'
import { Stat, Badge, Spinner, ErrorBox, Empty } from '../../components/ui'
import ProductCard from '../../components/ProductCard'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const { data: d, loading, error } = useAsync(() => buyerService.dashboard(), [])
  const { addToCart, toggleWish, wishIds } = useShopActions()
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />

  return (
    <>
      <div className="page-head"><div><h2>Hello, {user.name.split(' ')[0]} 👋</h2><p>Here is what is happening with your orders.</p></div>
        <Link to="/marketplace" className="btn btn-primary">Shop fresh produce</Link></div>
      <div className="stat-grid">
        <Stat icon="📦" value={d.totalOrders} text="Total orders" tone="blue" />
        <Stat icon="⏳" value={d.pendingOrders} text="Pending orders" tone="amber" />
        <Stat icon="✅" value={d.deliveredOrders} text="Delivered orders" tone="green" />
        <Stat icon="❤️" value={d.wishlistCount} text="Wishlist items" tone="red" />
        <Stat icon="💰" value={money(d.totalSpent)} text="Total spent" tone="purple" />
      </div>
      <div className="two-col">
        <div className="card">
          <div className="row between"><h3>Recent orders</h3><Link to="/buyer/orders" className="btn btn-ghost btn-sm">View all</Link></div>
          {d.recentOrders.length === 0 ? <Empty icon="🛒" title="No orders yet" text="Your first order is just a click away."><Link to="/marketplace" className="btn btn-primary">Browse products</Link></Empty> :
            d.recentOrders.map((o) => (
              <Link to={'/buyer/orders/' + o.id} className="list-item" key={o.id}>
                <div className="grow"><b>{o.orderCode}</b><div className="muted small">{o.itemCount} item(s) · {dateOnly(o.createdAt)} · {o.farmer.name}</div></div>
                <b>{money(o.totalAmount)}</b><Badge status={o.status} />
              </Link>))}
        </div>
        <div className="card">
          <div className="row between"><h3>Notifications</h3><Link to="/buyer/notifications" className="btn btn-ghost btn-sm">All</Link></div>
          {d.notifications.length === 0 ? <p className="muted">Nothing new.</p> : d.notifications.map((n) => (
            <div className="list-item" key={n.id}><div className="grow"><b className="small">{n.title}</b><div className="muted small">{n.message}</div></div><span className="muted small">{ago(n.createdAt)}</span></div>))}
        </div>
      </div>
      {d.recommendations.length > 0 && (
        <div className="mt2">
          <h2 className="mb">Recommended for you</h2>
          <div className="product-grid">
            {d.recommendations.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} wished={wishIds.has(p.id)} onWish={toggleWish} onAdd={addToCart} />)}
          </div>
        </div>
      )}
    </>
  )
}
