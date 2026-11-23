import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { money, ago, dateOnly, label } from '../../utils/format'
import { Stat, Badge, Spinner, ErrorBox, BarChart, Donut, HBars } from '../../components/ui'

const STATUS_COLORS = { PLACED: '#fb923c', ACCEPTED: '#e879f9', PROCESSING: '#facc15', SHIPPED: '#38bdf8', DELIVERED: '#a3e635', CANCELLED: '#FB7185' }

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data: d, loading, error } = useAsync(() => adminService.dashboard(), [])
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />

  return (
    <>
      <div className="page-head"><div><h2>Welcome, {user.name.split(' ')[0]} 🛡️</h2><p>Live overview of the whole marketplace.</p></div></div>
      {(d.pendingProducts > 0 || d.pendingFarmers > 0 || d.openComplaints > 0 || d.delayedOrders > 0) && (
        <div className="alert alert-warn">
          Needs attention:&nbsp;
          {d.pendingProducts > 0 && <Link to="/admin/products?approval=PENDING"><b>{d.pendingProducts} product(s)</b> awaiting approval</Link>}
          {d.pendingFarmers > 0 && <> · <Link to="/admin/farmers?verification=PENDING"><b>{d.pendingFarmers} farmer(s)</b> to verify</Link></>}
          {d.openComplaints > 0 && <> · <Link to="/admin/complaints"><b>{d.openComplaints} open complaint(s)</b></Link></>}
          {d.delayedOrders > 0 && <> · <Link to="/admin/orders?delayed=true"><b>{d.delayedOrders} delayed order(s)</b></Link></>}
        </div>)}
      <div className="stat-grid">
        <Stat icon="👨‍🌾" value={d.totalFarmers} text="Total farmers" tone="green" />
        <Stat icon="🛍️" value={d.totalCustomers} text="Total customers" tone="blue" />
        <Stat icon="👥" value={d.totalUsers} text="Registered users" tone="purple" />
        <Stat icon="🏡" value={d.totalFarms} text="Total farms" tone="green" />
        <Stat icon="🌱" value={d.totalCrops} text="Total crops" tone="green" />
        <Stat icon="🥕" value={d.totalProducts} text="Total products" tone="amber" />
        <Stat icon="⏳" value={d.pendingProducts} text="Pending approvals" tone="amber" />
        <Stat icon="✅" value={d.approvedProducts} text="Approved products" tone="green" />
        <Stat icon="🚫" value={d.rejectedProducts} text="Rejected products" tone="red" />
        <Stat icon="🧾" value={d.totalOrders} text="Total orders" tone="blue" />
        <Stat icon="📦" value={d.pendingOrders} text="Pending orders" tone="amber" />
        <Stat icon="🏠" value={d.deliveredOrders} text="Delivered orders" tone="green" />
        <Stat icon="❌" value={d.cancelledOrders} text="Cancelled orders" tone="red" />
        <Stat icon="💰" value={money(d.totalSales)} text="Total sales" tone="purple" />
        <Stat icon="🛠️" value={d.totalComplaints} text="Total complaints" tone="red" />
      </div>

      <div className="two-col mb">
        <div className="card"><h3>Sales (last 6 months)</h3>
          <BarChart data={d.salesByMonth.map((m) => ({ label: m.month, value: Number(m.sales), text: Number(m.sales) > 0 ? '₹' + Math.round(m.sales) : '' }))} /></div>
        <div className="card"><h3>Orders by status</h3>
          <Donut data={Object.entries(d.ordersByStatus).map(([k, v]) => ({ label: label(k), value: v, color: STATUS_COLORS[k] }))} /></div>
      </div>
      <div className="two-col mb">
        <div className="card"><h3>New registrations</h3>
          <div className="bars" style={{ height: 170 }}>
            {d.registrations.map((r) => {
              const top = Math.max(1, ...d.registrations.flatMap((x) => [x.farmers, x.customers]))
              return (
              <div className="bar-col" key={r.month}>
                <div className="row gap-sm" style={{ alignItems: 'flex-end', height: '100%', flexWrap: 'nowrap' }}>
                  <div className="bar" style={{ height: Math.max(3, (r.farmers / top) * 120) + 'px', width: 16, background: 'var(--primary)' }} title={r.farmers + ' farmers'} />
                  <div className="bar" style={{ height: Math.max(3, (r.customers / top) * 120) + 'px', width: 16, background: 'var(--amber)' }} title={r.customers + ' customers'} />
                </div><small>{r.month}</small>
              </div>)
            })}
          </div>
          <p className="small muted mt"><span style={{ color: 'var(--primary)' }}>■</span> Farmers &nbsp; <span style={{ color: 'var(--amber)' }}>■</span> Customers</p></div>
        <div className="card"><h3>Products by category</h3><HBars data={d.productsByCategory} /></div>
      </div>

      <div className="two-col mb">
        <div className="card"><div className="row between"><h3>Recent orders</h3><Link className="btn btn-ghost btn-sm" to="/admin/orders">View all</Link></div>
          {d.recentOrders.map((o) => (
            <Link to={'/admin/orders/' + o.id} className="list-item" key={o.id}><div className="grow"><b>{o.orderCode}</b><div className="muted small">{o.customer.name} → {o.farmer.name}</div></div><b>{money(o.totalAmount)}</b><Badge status={o.status} /></Link>))}</div>
        <div className="card"><h3>Recent registrations</h3>
          {d.recentUsers.map((u) => (
            <div className="list-item" key={u.id}><span className="avatar">{u.role === 'FARMER' ? '👨‍🌾' : '🛍️'}</span><div className="grow"><b>{u.name}</b><div className="muted small">{u.userCode} · {u.email}</div></div><span className="muted small">{dateOnly(u.createdAt)}</span></div>))}</div>
      </div>
      <div className="card"><div className="row between"><h3>Recent admin activity</h3><Link className="btn btn-ghost btn-sm" to="/admin/activity">Full log</Link></div>
        {d.recentActivities.length === 0 ? <p className="muted">No activity yet.</p> : d.recentActivities.map((a) => (
          <div className="list-item" key={a.id}><span className="badge b-gray">{label(a.action)}</span><div className="grow soft small">{a.details} <span className="muted">· {a.targetId}</span></div><span className="muted small">{a.adminName} · {ago(a.createdAt)}</span></div>))}</div>
    </>
  )
}
