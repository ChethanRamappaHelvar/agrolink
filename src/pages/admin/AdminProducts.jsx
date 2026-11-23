import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'
import { publicService } from '../../services/publicService'
import { useToast } from '../../context/ToastContext'
import { money, dateOnly, dateTime } from '../../utils/format'
import { Badge, Empty, Spinner, ConfirmDialog, Thumb, Modal, Field, ErrorBox } from '../../components/ui'
import { usePagedList, ListState, Select } from '../../components/admin/AdminBits'

export default function AdminProducts() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [approval, setApproval] = useState(params.get('approval') || '')
  const [stock, setStock] = useState('')
  const [sort, setSort] = useState('')
  const [cats, setCats] = useState([])
  const [view, setView] = useState(null)       // product id shown in the detail dialog
  const [act, setAct] = useState(null)         // { p, decision }
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const [picked, setPicked] = useState(new Set())   // ids ticked for bulk approve
  const [bulkBusy, setBulkBusy] = useState(false)
  const toast = useToast()
  const list = usePagedList(adminService.products, { search, categoryId, location, approval, stock, sort })

  useEffect(() => { adminService.categories().then(setCats).catch(() => {}) }, [])

  const decide = async (remark) => {
    try { await adminService.decide(act.p.id, act.decision, remark); toast.success('Product ' + act.decision.toLowerCase()); setAct(null); setView(null); list.reload() }
    catch (e) { toast.error(e.message); setAct(null) }
  }
  const tick = (id) => setPicked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const pendingHere = (list.data?.items || []).filter((p) => p.approvalStatus === 'PENDING')
  const allTicked = pendingHere.length > 0 && pendingHere.every((p) => picked.has(p.id))
  const tickAll = () => setPicked(allTicked ? new Set() : new Set(pendingHere.map((p) => p.id)))
  const bulkApprove = async () => {
    setBulkBusy(true)
    let ok = 0
    for (const id of picked) { try { await adminService.decide(id, 'APPROVED', ''); ok++ } catch { /* keep going */ } }
    setBulkBusy(false)
    toast[ok ? 'success' : 'error'](ok + ' of ' + picked.size + ' listings approved')
    setPicked(new Set()); list.reload()
  }
  const remove = async (reason) => {
    try { const r = await adminService.removeProduct(del.id, reason); toast.success(r.message); setDel(null); setView(null); list.reload() } catch (e) { toast.error(e.message); setDel(null) }
  }

  return (
    <>
      <div className="page-head"><div><h2>Product management</h2><p>Approve listings before customers can buy them.</p></div></div>
      <div className="chip-list mb">
        {[['', 'All'], ['PENDING', '⏳ Pending'], ['APPROVED', '✅ Approved'], ['REJECTED', '🚫 Rejected'], ['INACTIVE', '💤 Inactive']].map(([k, t]) => <button key={k} className={'chip' + (approval === k ? ' on' : '')} onClick={() => setApproval(k)}>{t}</button>)}
      </div>
      <div className="toolbar">
        <input className="input" placeholder="🔍 Product, code or farmer" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={categoryId} onChange={setCategoryId} options={cats.map((c) => [c.id, c.name])} all="All categories" />
        <input className="input" placeholder="📍 Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ maxWidth: 160 }} />
        <Select value={stock} onChange={setStock} options={[['low', 'Low stock'], ['out', 'Out of stock']]} all="Any stock" />
        <Select value={sort} onChange={setSort} options={[['price_asc', 'Price ↑'], ['price_desc', 'Price ↓'], ['stock_asc', 'Stock ↑']]} all="Newest first" />
      </div>
      {picked.size > 0 && <div className="bulk-bar"><b>{picked.size} selected</b><button className="btn btn-primary btn-sm" disabled={bulkBusy} onClick={bulkApprove}>{bulkBusy ? 'Approving...' : '✅ Approve selected'}</button><button className="btn btn-ghost btn-sm" onClick={() => setPicked(new Set())}>Clear</button></div>}
      <ListState list={list}>
        {list.data?.items.length === 0 ? <div className="card"><Empty icon="🥕" title="No products found" /></div> : (
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th style={{ width: 34 }}>{pendingHere.length > 0 && <input type="checkbox" checked={allTicked} onChange={tickAll} title="Select all pending on this page" />}</th><th>Product</th><th>Farmer</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
            <tbody>{list.data?.items.map((p) => (
              <tr key={p.id}><td>{p.approvalStatus === 'PENDING' && <input type="checkbox" checked={picked.has(p.id)} onChange={() => tick(p.id)} />}</td><td><div className="prod"><Thumb url={p.imageUrl} icon={p.categoryIcon} /><div><b>{p.name}</b><div className="muted small">{p.productCode} · {p.categoryName}</div></div></div></td>
                <td>{p.farmerName}<div className="muted small">📍 {p.location || p.state}</div></td><td>{money(p.price)}/{p.unit}</td>
                <td>{p.stock <= 0 ? <Badge status="OUT" /> : <>{p.stock} {p.stock <= p.lowStockThreshold && <Badge status="LOW" />}</>}</td>
                <td><Badge status={p.approvalStatus} />{!p.active && <div className="muted small">farmer switched off</div>}</td>
                <td><div className="row gap-sm" style={{ flexWrap: 'nowrap' }}><button className="btn btn-outline btn-sm" onClick={() => setView(p.id)}>View</button>
                  {p.approvalStatus !== 'APPROVED' && <button className="btn btn-primary btn-sm" onClick={() => setAct({ p, decision: 'APPROVED' })}>Approve</button>}
                  {p.approvalStatus === 'PENDING' && <button className="btn btn-danger-outline btn-sm" onClick={() => setAct({ p, decision: 'REJECTED' })}>Reject</button>}</div></td></tr>))}</tbody>
          </table></div>)}
      </ListState>

      {view && <ProductDialog id={view} onClose={() => setView(null)} onAct={(p, d) => setAct({ p, decision: d })} onEdit={setEdit} onDelete={setDel} />}
      {act && <ConfirmDialog title={{ APPROVED: 'Approve listing?', REJECTED: 'Reject listing?', INACTIVE: 'Deactivate listing?' }[act.decision]} message={act.p.name + ' by ' + act.p.farmerName}
        danger={act.decision !== 'APPROVED'} askReason={act.decision === 'REJECTED'} reasonLabel="Reason (shown to the farmer)" onConfirm={decide} onClose={() => setAct(null)} />}
      {edit && <EditDialog p={edit} cats={cats} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); setView(null); list.reload() }} />}
      {del && <ConfirmDialog title="Remove this listing?" message={'"' + del.name + '" will be removed (or deactivated if it has orders). The farmer is notified.'} danger askReason reasonLabel="Reason" confirmText="Remove" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}

function ProductDialog({ id, onClose, onAct, onEdit, onDelete }) {
  const [p, setP] = useState(null)
  useEffect(() => { adminService.product(id).then(setP) }, [id])
  return (
    <Modal title="Product details" size="lg" onClose={onClose} footer={p && <>
      <button className="btn btn-ghost" onClick={() => onEdit(p)}>✏️ Edit listing</button>
      <button className="btn btn-danger-outline" onClick={() => onDelete(p)}>🗑 Remove</button>
      {p.approvalStatus === 'APPROVED' && <button className="btn btn-outline" onClick={() => onAct(p, 'INACTIVE')}>Deactivate</button>}
      {p.approvalStatus !== 'APPROVED' && <button className="btn btn-primary" onClick={() => onAct(p, 'APPROVED')}>Approve</button>}
      {(p.approvalStatus === 'PENDING' || p.approvalStatus === 'APPROVED') && <button className="btn btn-danger" onClick={() => onAct(p, 'REJECTED')}>Reject</button>}</>}>
      {!p ? <Spinner /> : (
        <>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div className="pimg" style={{ width: 150, borderRadius: 14, flexShrink: 0 }}>{p.imageUrl ? <img src={(import.meta.env.VITE_API_URL || 'http://localhost:8080') + p.imageUrl} alt="" /> : p.categoryIcon}</div>
            <div className="grow"><h3 style={{ margin: 0 }}>{p.name}</h3><div className="muted small">{p.productCode} · {p.categoryName}</div>
              <div className="pprice mt">{money(p.price)} <small>/ {p.unit}</small></div><Badge status={p.approvalStatus} />
              {p.rejectionReason && <div className="alert alert-error mt">Rejected: {p.rejectionReason}</div>}
              <p className="soft mt">{p.description || 'No description.'}</p></div>
          </div>
          <div className="meta-grid"><div><small>Stock</small>{p.stock} {p.unit}</div><div><small>Quality</small>{p.quality || '-'}</div><div><small>Harvest</small>{dateOnly(p.harvestDate)}</div><div><small>Expiry</small>{dateOnly(p.expiryDate)}</div></div>
          <div className="card-flat" style={{ padding: 14 }}><b>👨‍🌾 {p.farmerName}</b> <span className="muted small">{p.farmerCode} · {p.farmerEmail} · 📞 {p.farmerPhone || '-'} · 📍 {p.location}</span> {p.farmerVerified ? <span className="badge b-green">Verified</span> : <span className="badge b-amber">Not verified</span>}</div>
          <h4 className="mt" style={{ fontFamily: 'var(--font)' }}>Approval history</h4>
          {p.approvalHistory.length === 0 ? <p className="muted small">No decisions yet.</p> : <ul className="timeline mt">{p.approvalHistory.map((h, i) => <li key={i}><Badge status={h.status} /> <span className="muted small">by {h.admin} · {dateTime(h.at)}</span>{h.reason && <div className="soft small">{h.reason}</div>}</li>)}</ul>}
        </>)}
    </Modal>
  )
}

function EditDialog({ p, cats, onClose, onSaved }) {
  const [f, setF] = useState({ name: p.name, description: p.description || '', categoryId: p.categoryId, price: p.price })
  const [err, setErr] = useState('')
  const toast = useToast()
  const save = async () => {
    try { await adminService.editProduct(p.id, { ...f, categoryId: Number(f.categoryId), price: Number(f.price) }); toast.success('Listing updated'); onSaved() } catch (e) { setErr(e.message) }
  }
  return (
    <Modal title={'Edit ' + p.name} size="sm" onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
      <ErrorBox message={err} />
      <Field label="Name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Category"><select className="input" value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Price (₹)"><input className="input" type="number" min="0" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
      <Field label="Description"><textarea className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
    </Modal>
  )
}
