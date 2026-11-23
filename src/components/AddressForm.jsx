import { useState } from 'react'
import { buyerService } from '../services/buyerService'
import { Modal, Field, ErrorBox } from './ui'
import { INDIAN_STATES } from '../utils/format'

/** Add / edit a delivery address. props: address (null = new), onSaved(), onClose() */
export default function AddressForm({ address, onSaved, onClose }) {
  const [f, setF] = useState(address || { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', defaultAddress: false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value })

  const save = async () => {
    if (!f.fullName.trim() || !f.line1.trim() || !f.city.trim() || !f.state) return setErr('Please fill all required fields')
    if (!/^\d{10}$/.test(f.phone)) return setErr('Phone number must be 10 digits')
    if (!/^\d{6}$/.test(f.pincode)) return setErr('Pincode must be 6 digits')
    setBusy(true)
    try {
      const saved = address ? await buyerService.updateAddress(address.id, f) : await buyerService.createAddress(f)
      onSaved(saved)
    } catch (e) { setErr(e.message); setBusy(false) }
  }

  return (
    <Modal title={address ? 'Edit address' : 'Add delivery address'} onClose={onClose} footer={
      <><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save address'}</button></>}>
      <ErrorBox message={err} />
      <div className="form-grid">
        <Field label="Label"><select className="input" name="label" value={f.label} onChange={set}><option>Home</option><option>Work</option><option>Other</option></select></Field>
        <Field label="Full name *"><input className="input" name="fullName" value={f.fullName} onChange={set} /></Field>
        <Field label="Phone *"><input className="input" name="phone" value={f.phone} onChange={set} maxLength={10} /></Field>
        <Field label="Pincode *"><input className="input" name="pincode" value={f.pincode} onChange={set} maxLength={6} /></Field>
        <Field label="Address line 1 *" full><input className="input" name="line1" value={f.line1} onChange={set} placeholder="House no, street" /></Field>
        <Field label="Address line 2" full><input className="input" name="line2" value={f.line2 || ''} onChange={set} placeholder="Landmark (optional)" /></Field>
        <Field label="City *"><input className="input" name="city" value={f.city} onChange={set} /></Field>
        <Field label="State *"><select className="input" name="state" value={f.state} onChange={set}><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
      </div>
      <label className="row small"><input type="checkbox" checked={f.defaultAddress} onChange={(e) => setF({ ...f, defaultAddress: e.target.checked })} /> Make this my default address</label>
    </Modal>
  )
}
