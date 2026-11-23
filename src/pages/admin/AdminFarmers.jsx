import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money, dateOnly, dateTime } from '../../utils/format'
import { Badge, Empty, Spinner, ErrorBox, ConfirmDialog, Thumb } from '../../components/ui'
import { usePagedList, ListState, Select } from '../../components/admin/AdminBits'

export function AdminFarmers() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')
  const [location, setLocation] = useState('')
  const [verification, setVerification] = useState(params.get('verification') || '')
  const [status, setStatus] = useState('')
  const [act, setAct] = useState(null)
  const toast = useToast()
  const list = usePagedList(adminService.farmers, { search, location, verification, status })

  const confirm = async (remark) => {
    try {
      if (act.type === 'status') await adminService.farmerStatus(act.f.userId, act.value)
      else await adminService.verifyFarmer(act.f.id, act.value, remark)
      toast.success('Farmer updated'); setAct(null); list.reload()
    } catch (e) { toast.error(e.message); setAct(null) }
  }

  return (
    <>
      <div className="page-head"><div><h2>Farmer management</h2><p>Verify farmers and control account access.</p></div></div>
      <div className="toolbar">
        <input className="input" placeholder="🔍 Name, email or ID (FRM-00001)" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="input" placeholder="📍 Location / state" value={location} onChange={(e) => setLocation(e.target.value)} style={{ maxWidth: 200 }} />
        <Select value={verification} onChange={setVerification} options={['PENDING', 'VERIFIED', 'REJECTED']} all="All verification" />
        <Select value={status} onChange={setStatus} options={['ACTIVE', 'INACTIVE']} all="All accounts" />
      </div>
      <ListState list={list}>
        {list.data?.items.length === 0 ? <div className="card"><Empty icon="👨‍🌾" title="No farmers found" /></div> : (
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th>Farmer</th><th>Location</th><th>Products</th><th>Orders</th><th>Sales</th><th>Verification</th><th>Account</th><th></th></tr></thead>
            <tbody>{list.data?.items.map((f) => (
              <tr key={f.id}><td><b>{f.name}</b><div className="muted small">{f.userCode} · {f.email}</div></td><td>{f.location}{f.state ? ', ' + f.state : ''}</td>
                <td>{f.productCount}</td><td>{f.orderCount}</td><td>{money(f.totalSales)}</td><td><Badge status={f.verificationStatus} /></td><td><Badge status={f.status} /></td>
                <td><div className="row gap-sm" style={{ flexWrap: 'nowrap' }}>
                  <Link to={'/admin/farmers/' + f.id} className="btn btn-outline btn-sm">View</Link>
                  {f.verificationStatus !== 'VERIFIED' && <button className="btn btn-primary btn-sm" onClick={() => setAct({ f, type: 'verify', value: 'VERIFIED' })}>Verify</button>}
                  {f.verificationStatus === 'PENDING' && <button className="btn btn-danger-outline btn-sm" onClick={() => setAct({ f, type: 'verify', value: 'REJECTED' })}>Reject</button>}
                  <button className={'btn btn-sm ' + (f.status === 'ACTIVE' ? 'btn-danger-outline' : 'btn-outline')} onClick={() => setAct({ f, type: 'status', value: f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}>{f.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></div></td></tr>))}</tbody>
          </table></div>)}
      </ListState>
      {act && <ConfirmDialog title={act.type === 'status' ? (act.value === 'ACTIVE' ? 'Activate account?' : 'Deactivate account?') : act.value === 'VERIFIED' ? 'Verify farmer?' : 'Reject verification?'}
        message={act.type === 'status' && act.value === 'INACTIVE' ? act.f.name + ' will be logged out and their products hidden from customers.' : act.f.name + ' (' + act.f.userCode + ')'}
        danger={act.value === 'INACTIVE' || act.value === 'REJECTED'} askReason={act.value === 'REJECTED'} reasonLabel="Reason for rejection" confirmText="Confirm" onConfirm={confirm} onClose={() => setAct(null)} />}
    </>
  )
}

export function AdminFarmerDetail() {
  const { id } = useParams()
  const { data: f, loading, error, reload } = useAsync(() => adminService.farmer(id), [id])
  const [act, setAct] = useState(null)
  const [tab, setTab] = useState('farms')
  const toast = useToast()
  if (loading) return <Spinner />
  if (error) return <ErrorBox message={error} />

  const confirm = async (remark) => {
    try {
      if (act.type === 'status') await adminService.farmerStatus(f.userId, act.value)
      else await adminService.verifyFarmer(f.id, act.value, remark)
      toast.success('Updated'); setAct(null); reload()
    } catch (e) { toast.error(e.message); setAct(null) }
  }

  return (
    <>
      <div className="page-head"><div><Link to="/admin/farmers" className="muted small">← Farmers</Link><h2>{f.name}</h2><p>{f.userCode} · {f.email} · 📞 {f.phone || '-'} · 📍 {f.location}{f.state ? ', ' + f.state : ''}</p></div>
        <div className="row"><Badge status={f.verificationStatus} /><Badge status={f.status} />
          {f.verificationStatus !== 'VERIFIED' && <button className="btn btn-primary btn-sm" onClick={() => setAct({ type: 'verify', value: 'VERIFIED' })}>Verify</button>}
          {f.verificationStatus !== 'REJECTED' && <button className="btn btn-danger-outline btn-sm" onClick={() => setAct({ type: 'verify', value: 'REJECTED' })}>Reject</button>}
          <button className="btn btn-outline btn-sm" onClick={() => setAct({ type: 'status', value: f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}>{f.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></div></div>
      <div className="stat-grid">
        <div className="stat"><div className="ico ico-green">🏡</div><div><b>{f.farms.length}</b><span>Farms</span></div></div>
        <div className="stat"><div className="ico ico-green">🌱</div><div><b>{f.crops.length}</b><span>Crops</span></div></div>
        <div className="stat"><div className="ico ico-amber">🥕</div><div><b>{f.products.length}</b><span>Products</span></div></div>
        <div className="stat"><div className="ico ico-blue">🧾</div><div><b>{f.orderCount}</b><span>Orders</span></div></div>
        <div className="stat"><div className="ico ico-purple">💰</div><div><b>{money(f.totalSales)}</b><span>Sales (delivered)</span></div></div>
      </div>
      {f.bio && <div className="card mb"><b>About:</b> <span className="soft">{f.bio}</span> {f.experienceYears ? <span className="muted"> · {f.experienceYears} yrs experience</span> : null}</div>}
      {f.verificationRemark && <div className="alert alert-warn">Last remark: {f.verificationRemark}</div>}

      <div className="tabs">{[['farms', 'Farms'], ['crops', 'Crops'], ['products', 'Products'], ['orders', 'Orders & sales'], ['complaints', 'Complaints'], ['history', 'Verification history']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</div>
      {tab === 'farms' && (f.farms.length === 0 ? <p className="muted">No farms added.</p> : <div className="table-wrap"><table className="tbl"><thead><tr><th>Farm</th><th>Location</th><th>Area</th><th>Soil</th><th>Irrigation</th></tr></thead><tbody>{f.farms.map((x) => <tr key={x.id}><td><b>{x.name}</b></td><td>{x.location}</td><td>{x.landArea} {x.areaUnit.toLowerCase()}</td><td>{x.soilType || '-'}</td><td>{x.irrigationType || '-'}</td></tr>)}</tbody></table></div>)}
      {tab === 'crops' && (f.crops.length === 0 ? <p className="muted">No crops recorded.</p> : <div className="table-wrap"><table className="tbl"><thead><tr><th>Crop</th><th>Farm</th><th>Season</th><th>Sowing</th><th>Harvest</th><th>Status</th></tr></thead><tbody>{f.crops.map((x) => <tr key={x.id}><td><b>{x.name}</b></td><td>{x.farmName || '-'}</td><td>{x.season}</td><td>{dateOnly(x.sowingDate)}</td><td>{dateOnly(x.expectedHarvestDate)}</td><td><Badge status={x.status} /></td></tr>)}</tbody></table></div>)}
      {tab === 'products' && (f.products.length === 0 ? <p className="muted">No products.</p> : <div className="table-wrap"><table className="tbl"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Approval</th></tr></thead><tbody>{f.products.map((p) => <tr key={p.id}><td><div className="prod"><Thumb url={p.imageUrl} icon={p.categoryIcon} /><div><b>{p.name}</b><div className="muted small">{p.productCode}</div></div></div></td><td>{money(p.price)} / {p.unit}</td><td>{p.stock}</td><td><Badge status={p.approvalStatus} /></td></tr>)}</tbody></table></div>)}
      {tab === 'orders' && (f.orders.length === 0 ? <p className="muted">No orders yet.</p> : <div className="table-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>{f.orders.map((o) => <tr key={o.id}><td><Link to={'/admin/orders/' + o.id} style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{o.orderCode}</Link></td><td>{o.customer.name}</td><td>{money(o.totalAmount)}</td><td>{dateOnly(o.createdAt)}</td><td><Badge status={o.status} /></td></tr>)}</tbody></table></div>)}
      {tab === 'complaints' && (f.complaints.length === 0 ? <p className="muted">No complaints against this farmer.</p> : f.complaints.map((c) => <div className="card mb" key={c.id}><div className="row between"><b>{c.subject}</b><Badge status={c.status} /></div><p className="soft small">{c.complaintCode} · from {c.customer.name} · {dateTime(c.createdAt)}</p></div>))}
      {tab === 'history' && (f.verificationHistory.length === 0 ? <p className="muted">No decisions yet.</p> : <div className="card"><ul className="timeline">{f.verificationHistory.map((h, i) => <li key={i}><Badge status={h.status} /> <span className="muted small">by {h.admin} · {dateTime(h.at)}</span>{h.remark && <div className="soft small">{h.remark}</div>}</li>)}</ul></div>)}

      {act && <ConfirmDialog title={act.type === 'status' ? (act.value === 'ACTIVE' ? 'Activate account?' : 'Deactivate account?') : act.value === 'VERIFIED' ? 'Verify this farmer?' : 'Reject verification?'} message={f.name}
        danger={act.value === 'INACTIVE' || act.value === 'REJECTED'} askReason={act.value === 'REJECTED'} reasonLabel="Reason for rejection" onConfirm={confirm} onClose={() => setAct(null)} />}
    </>
  )
}
