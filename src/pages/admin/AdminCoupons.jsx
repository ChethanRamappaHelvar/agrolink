import { useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money, dateOnly } from '../../utils/format'
import { Badge, Empty, Spinner, Modal, Field, ErrorBox, ConfirmDialog, Stat } from '../../components/ui'

const BLANK = { code: '', description: '', discountType: 'PERCENT', discountValue: '', minOrderAmount: '', maxDiscount: '', validFrom: '', validTo: '', usageLimit: '' }
const TONE = { ACTIVE: 'b-green', DISABLED: 'b-gray', EXPIRED: 'b-red', NOT_STARTED: 'b-blue', USED_UP: 'b-amber' }

export default function AdminCoupons() {
  const { data, loading, error, reload } = useAsync(() => adminService.coupons(), [])
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()

  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v))
  const save = async () => {
    const body = { ...form, code: form.code.trim().toUpperCase(), discountValue: num(form.discountValue), minOrderAmount: num(form.minOrderAmount),
      maxDiscount: num(form.maxDiscount), usageLimit: num(form.usageLimit), validFrom: form.validFrom || null, validTo: form.validTo || null }
    if (body.code.length < 3) return setErr('Code must be at least 3 characters')
    if (!body.discountValue || body.discountValue <= 0) return setErr('Enter a discount value')
    if (body.discountType === 'PERCENT' && body.discountValue > 100) return setErr('Percent discount cannot be more than 100')
    try {
      form.id ? await adminService.updateCoupon(form.id, body) : await adminService.createCoupon(body)
      toast.success('Coupon saved'); setForm(null); reload()
    } catch (e) { setErr(e.message) }
  }
  const toggle = async (c) => { try { await adminService.couponActive(c.id, !c.active); reload() } catch (e) { toast.error(e.message) } }
  const remove = async () => { try { await adminService.deleteCoupon(del.id); toast.success('Coupon deleted'); setDel(null); reload() } catch (e) { toast.error(e.message); setDel(null) } }

  if (loading) return <Spinner />
  const list = data || []
  const live = list.filter((c) => c.status === 'ACTIVE').length
  const uses = list.reduce((s, c) => s + (c.usedCount || 0), 0)

  return (
    <>
      <div className="page-head"><div><h2>Coupon codes</h2><p>Discounts that buyers can apply at checkout.</p></div>
        <button className="btn btn-primary" onClick={() => { setErr(''); setForm(BLANK) }}>+ New coupon</button></div>
      <ErrorBox message={error} />
      <div className="stat-grid">
        <Stat icon="🎟️" value={list.length} text="Total coupons" />
        <Stat icon="✅" value={live} text="Live right now" tone="green" />
        <Stat icon="🛍️" value={uses} text="Times redeemed" tone="amber" />
      </div>
      {list.length === 0 ? <div className="card"><Empty icon="🎟️" title="No coupons yet" text="Create your first discount code." /></div> : (
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>Code</th><th>Discount</th><th>Rules</th><th>Validity</th><th>Used</th><th>Status</th><th></th></tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id}>
              <td><b style={{ color: 'var(--primary)', letterSpacing: '.05em' }}>{c.code}</b><div className="muted small">{c.description || '—'}</div></td>
              <td><b>{c.discountType === 'PERCENT' ? c.discountValue + '%' : money(c.discountValue)}</b>{c.discountType === 'PERCENT' && c.maxDiscount && <div className="muted small">up to {money(c.maxDiscount)}</div>}</td>
              <td className="small">{c.minOrderAmount > 0 ? 'Min ' + money(c.minOrderAmount) : 'No minimum'}</td>
              <td className="small">{c.validFrom ? dateOnly(c.validFrom) : 'Any time'} → {c.validTo ? dateOnly(c.validTo) : 'No end'}</td>
              <td>{c.usedCount}{c.usageLimit ? ' / ' + c.usageLimit : ''}</td>
              <td><span className={'badge ' + (TONE[c.status] || 'b-gray')}>{c.status.replace('_', ' ')}</span></td>
              <td><div className="row gap-sm" style={{ flexWrap: 'nowrap' }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ ...BLANK, ...c, description: c.description || '', minOrderAmount: c.minOrderAmount ?? '', maxDiscount: c.maxDiscount ?? '', usageLimit: c.usageLimit ?? '', validFrom: c.validFrom || '', validTo: c.validTo || '' }) }}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggle(c)}>{c.active ? 'Disable' : 'Enable'}</button>
                <button className="btn btn-danger-outline btn-sm" onClick={() => setDel(c)}>🗑</button></div></td>
            </tr>))}</tbody>
        </table></div>)}

      {form && (
        <Modal title={form.id ? 'Edit coupon' : 'New coupon'} onClose={() => setForm(null)} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save coupon</button></>}>
          <ErrorBox message={err} />
          <div className="form-grid">
            <Field label="Code *" hint="Letters and numbers, e.g. DIWALI25"><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={30} /></Field>
            <Field label="Discount type"><select className="input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}><option value="PERCENT">Percentage (%)</option><option value="FLAT">Flat amount (₹)</option></select></Field>
            <Field label={form.discountType === 'PERCENT' ? 'Percent off *' : 'Amount off (₹) *'}><input className="input" type="number" min="0" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></Field>
            <Field label="Maximum discount (₹)" hint="Only for percentage coupons"><input className="input" type="number" min="0" disabled={form.discountType !== 'PERCENT'} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} /></Field>
            <Field label="Minimum order (₹)"><input className="input" type="number" min="0" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} /></Field>
            <Field label="Usage limit" hint="Empty = unlimited"><input className="input" type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} /></Field>
            <Field label="Valid from"><input className="input" type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} /></Field>
            <Field label="Valid until"><input className="input" type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} /></Field>
            <Field label="Description" full><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown to buyers at checkout" /></Field>
          </div>
        </Modal>)}
      {del && <ConfirmDialog title="Delete coupon?" message={'Delete ' + del.code + '? Past orders keep their discount.'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
