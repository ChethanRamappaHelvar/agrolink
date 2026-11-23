import { useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money } from '../../utils/format'
import { Badge, Empty, Spinner, Modal, Field, ErrorBox, ConfirmDialog } from '../../components/ui'

export default function AdminCategories() {
  const { data, loading, reload } = useAsync(() => adminService.categories(), [])
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [show, setShow] = useState(null)
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const toast = useToast()

  const save = async () => {
    if (!form.name.trim()) return setErr('Category name is required')
    try { form.id ? await adminService.updateCategory(form.id, form) : await adminService.createCategory(form); toast.success('Category saved'); setForm(null); reload() } catch (e) { setErr(e.message) }
  }
  const toggle = async (c) => { try { await adminService.categoryActive(c.id, !c.active); reload() } catch (e) { toast.error(e.message) } }
  const remove = async () => { try { await adminService.deleteCategory(del.id); toast.success('Category deleted'); setDel(null); reload() } catch (e) { toast.error(e.message); setDel(null) } }
  const open = async (c) => { setShow(c); setItems(await adminService.categoryProducts(c.id)) }

  if (loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><h2>Product categories</h2><p>Deactivated categories are hidden from the marketplace.</p></div><button className="btn btn-primary" onClick={() => { setErr(''); setForm({ name: '', description: '', icon: '🌿' }) }}>+ Add category</button></div>
      {data.length === 0 ? <div className="card"><Empty icon="🗂️" title="No categories" /></div> : (
        <div className="three-col" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {data.map((c) => (
            <div className="card" key={c.id} style={{ opacity: c.active ? 1 : 0.6 }}>
              <div className="row between"><span style={{ fontSize: '2.2rem' }}>{c.icon}</span><Badge status={c.active ? 'ACTIVE' : 'INACTIVE'} /></div>
              <h3 style={{ margin: '8px 0 2px' }}>{c.name}</h3><p className="muted small">{c.description || '—'}</p>
              <p className="mt small"><b>{c.productCount}</b> products · <b>{c.approvedCount}</b> approved</p>
              <div className="row mt">
                <button className="btn btn-ghost btn-sm" onClick={() => open(c)}>Products</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ ...c, description: c.description || '' }) }}>Edit</button>
                <button className="btn btn-outline btn-sm" onClick={() => toggle(c)}>{c.active ? 'Deactivate' : 'Activate'}</button>
                <button className="btn btn-danger-outline btn-sm" onClick={() => setDel(c)}>🗑</button></div>
            </div>))}
        </div>)}
      {form && (
        <Modal title={form.id ? 'Edit category' : 'Add category'} size="sm" onClose={() => setForm(null)} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <ErrorBox message={err} />
          <Field label="Name *"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Icon (emoji)"><input className="input" value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4} /></Field>
          <Field label="Description"><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        </Modal>)}
      {show && (
        <Modal title={'Products in ' + show.name} onClose={() => setShow(null)}>
          {items.length === 0 ? <p className="muted">No products in this category.</p> : items.map((p) => <div className="list-item" key={p.id}><div className="grow"><b>{p.name}</b><div className="muted small">{p.farmerName} · {money(p.price)}/{p.unit}</div></div><Badge status={p.approvalStatus} /></div>)}
        </Modal>)}
      {del && <ConfirmDialog title="Delete category?" message={'Delete "' + del.name + '"? This only works when the category has no products.'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
