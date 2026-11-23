import { useState } from 'react'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { Empty, Spinner, Modal, Field, ErrorBox, ConfirmDialog } from '../../components/ui'

const SOILS = ['Alluvial', 'Black (Regur)', 'Red loamy', 'Sandy', 'Clay', 'Laterite', 'Loamy']
const IRRIGATION = ['Drip', 'Sprinkler', 'Canal', 'Borewell', 'Rain-fed', 'Flood']
const BLANK = { name: '', location: '', landArea: '', areaUnit: 'ACRE', soilType: '', irrigationType: '', description: '' }

export default function Farms() {
  const { data, loading, reload } = useAsync(() => farmerService.farms(), [])
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async () => {
    if (!form.name.trim() || !form.location.trim()) return setErr('Farm name and location are required')
    if (!(Number(form.landArea) > 0)) return setErr('Land area must be greater than 0')
    try {
      const body = { ...form, landArea: Number(form.landArea) }
      form.id ? await farmerService.updateFarm(form.id, body) : await farmerService.createFarm(body)
      toast.success('Farm saved'); setForm(null); reload()
    } catch (e) { setErr(e.message) }
  }
  const remove = async () => { await farmerService.deleteFarm(del.id); toast.success('Farm deleted'); setDel(null); reload() }

  if (loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><h2>My farms</h2><p>Manage one or more farms under your account.</p></div><button className="btn btn-primary" onClick={() => { setErr(''); setForm({ ...BLANK }) }}>+ Add farm</button></div>
      {data.length === 0 ? <div className="card"><Empty icon="🏡" title="No farms added" text="Add your first farm to start recording crops." /></div> : (
        <div className="three-col" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {data.map((f) => (
            <div className="card" key={f.id}>
              <div className="row between"><span style={{ fontSize: '2rem' }}>🏡</span><span className="badge b-green">{f.cropCount} crop(s)</span></div>
              <h3 style={{ margin: '8px 0 2px' }}>{f.name}</h3>
              <p className="muted small">📍 {f.location}</p>
              <div className="meta-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div><small>Area</small>{f.landArea} {f.areaUnit.toLowerCase()}</div><div><small>Soil</small>{f.soilType || '-'}</div><div><small>Water</small>{f.irrigationType || '-'}</div>
              </div>
              {f.description && <p className="soft small">{f.description}</p>}
              <div className="row mt"><button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ ...f, soilType: f.soilType || '', irrigationType: f.irrigationType || '', description: f.description || '' }) }}>Edit</button><button className="btn btn-danger-outline btn-sm" onClick={() => setDel(f)}>Delete</button></div>
            </div>))}
        </div>)}
      {form && (
        <Modal title={form.id ? 'Edit farm' : 'Add farm'} onClose={() => setForm(null)} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save farm</button></>}>
          <ErrorBox message={err} />
          <div className="form-grid">
            <Field label="Farm name *"><input className="input" name="name" value={form.name} onChange={set} /></Field>
            <Field label="Location *"><input className="input" name="location" value={form.location} onChange={set} placeholder="Village, District" /></Field>
            <Field label="Land area *"><input className="input" type="number" min="0" step="0.1" name="landArea" value={form.landArea} onChange={set} /></Field>
            <Field label="Measurement unit"><select className="input" name="areaUnit" value={form.areaUnit} onChange={set}><option value="ACRE">Acre</option><option value="HECTARE">Hectare</option><option value="GUNTHA">Guntha</option><option value="SQ_METER">Sq. meter</option></select></Field>
            <Field label="Soil type"><select className="input" name="soilType" value={form.soilType} onChange={set}><option value="">Select</option>{SOILS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Irrigation type"><select className="input" name="irrigationType" value={form.irrigationType} onChange={set}><option value="">Select</option>{IRRIGATION.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Description" full><textarea className="input" name="description" value={form.description} onChange={set} /></Field>
          </div>
        </Modal>)}
      {del && <ConfirmDialog title="Delete farm?" message={'Delete "' + del.name + '"? Its crops are kept but will no longer be linked to a farm.'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
