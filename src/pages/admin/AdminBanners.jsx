import { useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { dateOnly } from '../../utils/format'
import { Empty, Spinner, Modal, Field, ErrorBox, ConfirmDialog } from '../../components/ui'

const BLANK = { title: '', message: '', link: '', style: 'INFO', startDate: '', endDate: '' }
const STYLES = [['INFO', 'Info (orange tint)'], ['SALE', 'Sale (orange → lime)'], ['WARNING', 'Warning (yellow)']]

export default function AdminBanners() {
  const { data, loading, error, reload } = useAsync(() => adminService.banners(), [])
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) return setErr('Title and message are required')
    const body = { ...form, startDate: form.startDate || null, endDate: form.endDate || null, link: form.link || null }
    try { form.id ? await adminService.updateBanner(form.id, body) : await adminService.createBanner(body); toast.success('Banner saved'); setForm(null); reload() } catch (e) { setErr(e.message) }
  }
  const toggle = async (b) => { try { await adminService.bannerActive(b.id, !b.active); reload() } catch (e) { toast.error(e.message) } }
  const remove = async () => { try { await adminService.deleteBanner(del.id); toast.success('Banner deleted'); setDel(null); reload() } catch (e) { toast.error(e.message); setDel(null) } }

  if (loading) return <Spinner />
  const list = data || []
  return (
    <>
      <div className="page-head"><div><h2>Home page banners</h2><p>Announcements and sale strips shown at the top of the home page.</p></div>
        <button className="btn btn-primary" onClick={() => { setErr(''); setForm(BLANK) }}>+ New banner</button></div>
      <ErrorBox message={error} />
      {list.length === 0 ? <div className="card"><Empty icon="📢" title="No banners yet" /></div> : (
        <div style={{ display: 'grid', gap: 14 }}>
          {list.map((b) => (
            <div className="card" key={b.id} style={{ opacity: b.active ? 1 : 0.6 }}>
              <div className={'banner ' + b.style} style={{ borderRadius: 10, border: 'none', marginBottom: 12 }}><span><b>{b.title}</b> — {b.message}</span></div>
              <div className="row between">
                <div className="muted small">{b.startDate ? dateOnly(b.startDate) : 'Starts now'} → {b.endDate ? dateOnly(b.endDate) : 'No end date'}{b.link ? ' · link: ' + b.link : ''}</div>
                <div className="row gap-sm">
                  <span className={'badge ' + (b.active ? 'b-green' : 'b-gray')}>{b.active ? 'Active' : 'Hidden'}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ ...BLANK, ...b, link: b.link || '', startDate: b.startDate || '', endDate: b.endDate || '' }) }}>Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggle(b)}>{b.active ? 'Hide' : 'Show'}</button>
                  <button className="btn btn-danger-outline btn-sm" onClick={() => setDel(b)}>🗑</button></div>
              </div>
            </div>))}
        </div>)}
      {form && (
        <Modal title={form.id ? 'Edit banner' : 'New banner'} onClose={() => setForm(null)} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save banner</button></>}>
          <ErrorBox message={err} />
          <Field label="Title *"><input className="input" value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Message *"><textarea className="input" value={form.message} maxLength={400} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
          <div className="form-grid">
            <Field label="Style"><select className="input" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>{STYLES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></Field>
            <Field label="Link" hint="/marketplace or https://..."><input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></Field>
            <Field label="Show from"><input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
            <Field label="Show until"><input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          </div>
        </Modal>)}
      {del && <ConfirmDialog title="Delete banner?" message={'Delete "' + del.title + '"?'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
