import { useState } from 'react'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { dateOnly, dateTime, label } from '../../utils/format'
import { Badge, Empty, Spinner, Modal, Field, ErrorBox, ConfirmDialog } from '../../components/ui'

const CATS = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Oilseeds', 'Fodder', 'Other']
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Perennial']
const BLANK = { name: '', category: 'Vegetables', farmId: '', sowingDate: '', expectedHarvestDate: '', area: '', season: 'Kharif', status: 'PLANNED' }

export default function Crops() {
  const [tab, setTab] = useState('crops')           // crops | upcoming | history
  const [status, setStatus] = useState('')
  const crops = useAsync(() => farmerService.crops(status), [status])
  const farms = useAsync(() => farmerService.farms(), [])
  const upcoming = useAsync(() => farmerService.upcoming(), [])
  const history = useAsync(() => farmerService.cropHistory(), [])
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [note, setNote] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const reloadAll = () => { crops.reload(); upcoming.reload(); history.reload() }

  const save = async () => {
    if (!form.name.trim() || !form.sowingDate || !form.expectedHarvestDate) return setErr('Crop name, sowing date and harvest date are required')
    if (form.expectedHarvestDate < form.sowingDate) return setErr('Harvest date cannot be before the sowing date')
    try {
      const body = { ...form, farmId: form.farmId ? Number(form.farmId) : null, area: form.area === '' ? null : Number(form.area) }
      form.id ? await farmerService.updateCrop(form.id, body) : await farmerService.createCrop(body)
      toast.success('Crop saved'); setForm(null); reloadAll()
    } catch (e) { setErr(e.message) }
  }
  const remove = async () => { await farmerService.deleteCrop(del.id); toast.success('Crop deleted'); setDel(null); reloadAll() }
  const saveNote = async () => {
    try { await farmerService.addCropRecord(note.id, { action: 'NOTE', note: note.text }); toast.success('Note added'); setNote(null); history.reload() } catch (e) { toast.error(e.message) }
  }

  return (
    <>
      <div className="page-head"><div><h2>Crop management</h2><p>Track every crop from sowing to harvest.</p></div><button className="btn btn-primary" onClick={() => { setErr(''); setForm({ ...BLANK }) }}>+ Add crop</button></div>
      <div className="tabs">{[['crops', '🌱 My crops'], ['upcoming', '⏰ Upcoming harvests'], ['history', '📜 Cultivation history']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</div>

      {tab === 'crops' && (
        <>
          <div className="chip-list mb">{['', 'PLANNED', 'GROWING', 'HARVESTED'].map((s) => <button key={s} className={'chip' + (status === s ? ' on' : '')} onClick={() => setStatus(s)}>{s ? label(s) : 'All'}</button>)}</div>
          {crops.loading ? <Spinner /> : (crops.data || []).length === 0 ? <div className="card"><Empty icon="🌱" title="No crops found" text="Add a crop to start tracking." /></div> : (
            <div className="table-wrap"><table className="tbl">
              <thead><tr><th>Crop</th><th>Farm</th><th>Season</th><th>Area</th><th>Sowing</th><th>Harvest</th><th>Status</th><th></th></tr></thead>
              <tbody>{crops.data.map((c) => (
                <tr key={c.id}><td><b>{c.name}</b><div className="muted small">{c.category}</div></td><td>{c.farmName || '-'}</td><td>{c.season || '-'}</td><td>{c.area ?? '-'}</td>
                  <td>{dateOnly(c.sowingDate)}</td><td>{dateOnly(c.expectedHarvestDate)}{c.status !== 'HARVESTED' && <div className="muted small">{c.daysToHarvest >= 0 ? c.daysToHarvest + ' days left' : Math.abs(c.daysToHarvest) + ' days overdue'}</div>}</td>
                  <td><Badge status={c.status} /></td>
                  <td><div className="row gap-sm" style={{ flexWrap: 'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setNote({ id: c.id, name: c.name, text: '' })}>📝</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ ...c, farmId: c.farmId || '', area: c.area ?? '', category: c.category || 'Vegetables', season: c.season || 'Kharif' }) }}>Edit</button>
                    <button className="btn btn-danger-outline btn-sm" onClick={() => setDel(c)}>Delete</button></div></td></tr>))}</tbody>
            </table></div>)}
        </>)}

      {tab === 'upcoming' && (upcoming.loading ? <Spinner /> : (upcoming.data || []).length === 0 ? <div className="card"><Empty icon="⏰" title="No harvests due in the next 30 days" /></div> : (
        <div className="three-col" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {upcoming.data.map((c) => (
            <div className="card" key={c.id}><div className="row between"><h3 style={{ margin: 0 }}>{c.name}</h3><Badge status={c.status} /></div>
              <p className="muted small">{c.farmName || 'No farm'} · {c.season}</p>
              <p className="mt">Harvest on <b>{dateOnly(c.expectedHarvestDate)}</b></p>
              <span className={'badge ' + (c.overdue ? 'b-red' : c.daysToHarvest <= 7 ? 'b-amber' : 'b-green')}>{c.overdue ? Math.abs(c.daysToHarvest) + ' days overdue' : c.daysToHarvest + ' days left'}</span></div>))}
        </div>))}

      {tab === 'history' && (history.loading ? <Spinner /> : (history.data || []).length === 0 ? <div className="card"><Empty icon="📜" title="No history yet" /></div> : (
        <div className="card"><ul className="timeline">{history.data.map((r) => (
          <li key={r.id} className={r.action === 'NOTE' ? 'note' : ''}><b>{r.cropName}</b> <span className="badge b-gray">{label(r.action)}</span>{r.season && <span className="muted small"> · {r.season}</span>}
            <div className="muted small">{dateTime(r.recordedAt)}</div>{r.note && <div className="soft small">{r.note}</div>}</li>))}</ul></div>))}

      {form && (
        <Modal title={form.id ? 'Edit crop' : 'Add crop'} onClose={() => setForm(null)} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save crop</button></>}>
          <ErrorBox message={err} />
          <div className="form-grid">
            <Field label="Crop name *"><input className="input" name="name" value={form.name} onChange={set} /></Field>
            <Field label="Category"><select className="input" name="category" value={form.category} onChange={set}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Farm"><select className="input" name="farmId" value={form.farmId} onChange={set}><option value="">— none —</option>{(farms.data || []).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></Field>
            <Field label="Cultivated area"><input className="input" type="number" min="0" step="0.1" name="area" value={form.area} onChange={set} /></Field>
            <Field label="Sowing date *"><input className="input" type="date" name="sowingDate" value={form.sowingDate} onChange={set} /></Field>
            <Field label="Expected harvest date *"><input className="input" type="date" name="expectedHarvestDate" value={form.expectedHarvestDate} onChange={set} /></Field>
            <Field label="Season"><select className="input" name="season" value={form.season} onChange={set}>{SEASONS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Status"><select className="input" name="status" value={form.status} onChange={set}><option value="PLANNED">Planned</option><option value="GROWING">Growing</option><option value="HARVESTED">Harvested</option></select></Field>
          </div>
        </Modal>)}
      {note && <Modal title={'Add note: ' + note.name} size="sm" onClose={() => setNote(null)} footer={<><button className="btn btn-ghost" onClick={() => setNote(null)}>Cancel</button><button className="btn btn-primary" disabled={!note.text.trim()} onClick={saveNote}>Save note</button></>}>
        <Field label="Cultivation note"><textarea className="input" value={note.text} onChange={(e) => setNote({ ...note, text: e.target.value })} placeholder="Fertilizer applied, irrigation, pest control..." /></Field></Modal>}
      {del && <ConfirmDialog title="Delete crop?" message={'Delete "' + del.name + '" and its cultivation history?'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
