import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminService } from '../../services/admin/adminService'
import { useToast } from '../../context/ToastContext'
import { dateTime } from '../../utils/format'
import { Badge, Empty, Spinner, Modal, Field, ErrorBox } from '../../components/ui'
import { usePagedList, ListState, Select } from '../../components/admin/AdminBits'

export default function AdminComplaints() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(null)
  const list = usePagedList(adminService.complaints, { search, status })

  return (
    <>
      <div className="page-head"><div><h2>Complaint management</h2><p>Respond to customers and record the resolution.</p></div></div>
      <div className="chip-list mb">{[['', 'All'], ['OPEN', 'Open'], ['UNDER_REVIEW', 'Under review'], ['RESOLVED', 'Resolved'], ['REJECTED', 'Rejected']].map(([k, t]) => <button key={k} className={'chip' + (status === k ? ' on' : '')} onClick={() => setStatus(k)}>{t}</button>)}</div>
      <div className="toolbar"><input className="input" placeholder="🔍 Subject, code, customer or farmer" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 340 }} /></div>
      <ListState list={list}>
        {list.data?.items.length === 0 ? <div className="card"><Empty icon="🛠️" title="No complaints found" /></div> : (
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th>Complaint</th><th>Customer</th><th>Farmer</th><th>Order</th><th>Status</th><th></th></tr></thead>
            <tbody>{list.data?.items.map((c) => (
              <tr key={c.id}><td><b>{c.subject}</b><div className="muted small">{c.complaintCode} · {dateTime(c.createdAt)}</div></td><td>{c.customer.name}</td><td>{c.farmer?.name || '-'}</td><td>{c.orderCode || '-'}</td><td><Badge status={c.status} /></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => setOpen(c.id)}>Open</button></td></tr>))}</tbody>
          </table></div>)}
      </ListState>
      {open && <ComplaintDialog id={open} onClose={() => setOpen(null)} onSaved={() => list.reload()} />}
    </>
  )
}

function ComplaintDialog({ id, onClose, onSaved }) {
  const [c, setC] = useState(null)
  const [f, setF] = useState({ status: '', response: '', resolution: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const load = () => adminService.complaint(id).then((x) => { setC(x); setF({ status: x.status, response: x.adminResponse || '', resolution: x.resolution || '' }) })
  useEffect(() => { load() }, [id])

  const save = async () => {
    setErr(''); setBusy(true)
    try { const x = await adminService.updateComplaint(id, f); setC(x); toast.success('Complaint updated and customer notified'); onSaved() } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  return (
    <Modal title={c ? c.complaintCode + ' · ' + c.subject : 'Complaint'} size="lg" onClose={onClose} footer={c && <><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save & notify customer'}</button></>}>
      {!c ? <Spinner /> : (
        <div className="two-col" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start' }}>
          <div>
            <div className="row mb"><Badge status={c.status} /><span className="muted small">{dateTime(c.createdAt)}</span></div>
            <p className="soft">{c.description}</p>
            <div className="meta-grid"><div><small>Customer</small>{c.customer.name}<br /><span className="muted small">{c.customer.userCode}</span></div><div><small>Farmer</small>{c.farmer ? c.farmer.name : '-'}<br /><span className="muted small">{c.farmer?.userCode}</span></div><div><small>Order</small>{c.orderCode || '-'}</div></div>
            <ErrorBox message={err} />
            <Field label="Status"><select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="OPEN">Open</option><option value="UNDER_REVIEW">Under review</option><option value="RESOLVED">Resolved</option><option value="REJECTED">Rejected</option></select></Field>
            <Field label="Response to customer"><textarea className="input" value={f.response} onChange={(e) => setF({ ...f, response: e.target.value })} /></Field>
            <Field label="Resolution details (required when resolved)"><textarea className="input" value={f.resolution} onChange={(e) => setF({ ...f, resolution: e.target.value })} /></Field>
          </div>
          <div><h4 style={{ fontFamily: 'var(--font)' }}>Complaint history</h4>
            <ul className="timeline mt">{c.history.map((h, i) => <li key={i}><Badge status={h.status} /> <span className="muted small">{h.by} · {dateTime(h.at)}</span>{h.note && <div className="soft small">{h.note}</div>}</li>)}</ul></div>
        </div>)}
    </Modal>
  )
}
