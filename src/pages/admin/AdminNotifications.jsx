import { useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { dateTime } from '../../utils/format'
import { Field, ErrorBox, Empty, Spinner } from '../../components/ui'

const TARGETS = [['ALL', '📣 Everyone (announcement)'], ['FARMERS', '👨‍🌾 All farmers'], ['CUSTOMERS', '🛍️ All customers']]

export default function AdminNotifications() {
  const [f, setF] = useState({ target: 'ALL', title: '', message: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const hist = useAsync(() => adminService.sentNotifications(), [])
  const toast = useToast()

  const send = async (e) => {
    e.preventDefault(); setErr('')
    if (!f.title.trim() || !f.message.trim()) return setErr('Title and message are required')
    setBusy(true)
    try { const r = await adminService.sendNotification(f); toast.success(r.message); setF({ ...f, title: '', message: '' }); hist.reload() } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  return (
    <>
      <div className="page-head"><div><h2>Send notifications</h2><p>Announcements appear in the bell icon of the selected users. Product and account decisions notify users automatically.</p></div></div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1.2fr', alignItems: 'start' }}>
        <form className="card" onSubmit={send}>
          <h3>New notification</h3><ErrorBox message={err} />
          <Field label="Send to"><select className="input" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })}>{TARGETS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></Field>
          <Field label="Title"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={150} /></Field>
          <Field label="Message"><textarea className="input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={1000} /></Field>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send notification'}</button>
        </form>
        <div className="card"><h3>Notification history</h3>
          {hist.loading ? <Spinner /> : (hist.data || []).length === 0 ? <Empty icon="📣" title="Nothing sent yet" /> : hist.data.map((n) => (
            <div className="list-item" key={n.id} style={{ alignItems: 'flex-start' }}><div className="grow"><b>{n.title}</b><div className="soft small">{n.message}</div><div className="muted small">{n.adminName} · {dateTime(n.createdAt)}</div></div>
              <div className="right"><span className="badge b-blue">{n.target}</span><div className="muted small">{n.recipients} user(s)</div></div></div>))}</div>
      </div>
    </>
  )
}
