import { Link } from 'react-router-dom'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { money, dateOnly } from '../../utils/format'
import { Stat, Badge, Spinner, ErrorBox, BarChart, Empty } from '../../components/ui'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const { data: d, loading, error } = useAsync(() => farmerService.dashboard(), [])
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />

  return (
    <>
      <div className="page-head"><div><h2>Namaste, {user.name.split(' ')[0]} 🌾</h2><p>Your farm business at a glance.</p></div><Link className="btn btn-primary" to="/farmer/products/new">+ Add product</Link></div>
      {user.verificationStatus === 'PENDING' && <div className="alert alert-warn">⏳ Your farmer account is waiting for admin verification. You can add products, but buyers see them after approval.</div>}
      {user.verificationStatus === 'REJECTED' && <div className="alert alert-error">Your verification was rejected{user.verificationRemark ? ': ' + user.verificationRemark : '.'}</div>}
      <div className="stat-grid">
        <Stat icon="🥕" value={d.totalProducts} text="Total products" tone="green" />
        <Stat icon="✅" value={d.activeProducts} text="Active products" tone="blue" />
        <Stat icon="🧾" value={d.totalOrders} text="Total orders" tone="purple" />
        <Stat icon="⏳" value={d.pendingOrders} text="Pending orders" tone="amber" />
        <Stat icon="📦" value={d.completedOrders} text="Completed orders" tone="green" />
        <Stat icon="💰" value={money(d.totalSales)} text="Total sales" tone="amber" />
      </div>
      <div className="two-col mb">
        <div className="card">
          <h3>Sales in the last 6 months</h3>
          <BarChart data={d.salesByMonth.map((m) => ({ label: m.month, value: Number(m.sales), text: Number(m.sales) > 0 ? '₹' + Math.round(m.sales) : '' }))} />
          <p className="muted small mt">Earnings still to come from open orders: <b>{money(d.pendingEarnings)}</b></p>
        </div>
        <div className="card">
          <h3>⚠️ Low stock alerts</h3>
          {d.lowStock.length === 0 ? <p className="muted">All products are well stocked.</p> : d.lowStock.map((p) => (
            <div className="list-item" key={p.productId}><div className="grow"><b>{p.name}</b><div className="muted small">{p.quantity} {p.unit} left (alert at {p.lowStockThreshold})</div></div><Badge status={p.stockStatus} /></div>))}
          <Link to="/farmer/inventory" className="btn btn-ghost btn-sm mt">Manage inventory →</Link>
        </div>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="row between"><h3>Recent orders</h3><Link to="/farmer/orders" className="btn btn-ghost btn-sm">View all</Link></div>
          {d.recentOrders.length === 0 ? <Empty icon="🧾" title="No orders yet" /> : d.recentOrders.map((o) => (
            <Link to={'/farmer/orders/' + o.id} className="list-item" key={o.id}>
              <div className="grow"><b>{o.orderCode}</b><div className="muted small">{o.customer.name} · {dateOnly(o.createdAt)}</div></div><b>{money(o.totalAmount)}</b><Badge status={o.status} />
            </Link>))}
        </div>
        <div className="card">
          <div className="row between"><h3>🌾 Upcoming harvests</h3><Link to="/farmer/crops" className="btn btn-ghost btn-sm">Crops</Link></div>
          {d.upcomingHarvests.length === 0 ? <p className="muted">No harvest due in the next 30 days.</p> : d.upcomingHarvests.map((c) => (
            <div className="list-item" key={c.id}><div className="grow"><b>{c.name}</b><div className="muted small">{c.farmName || 'No farm'} · {dateOnly(c.expectedHarvestDate)}</div></div>
              <span className={'badge ' + (c.overdue ? 'b-red' : c.daysToHarvest <= 7 ? 'b-amber' : 'b-green')}>{c.overdue ? Math.abs(c.daysToHarvest) + ' d overdue' : c.daysToHarvest + ' d left'}</span></div>))}
        </div>
      </div>
    </>
  )
}
