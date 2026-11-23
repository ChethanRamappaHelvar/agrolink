import { useState } from 'react'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money, dateOnly, label } from '../../utils/format'
import { Empty, Spinner, Modal, Field, ErrorBox, ConfirmDialog, Stat, Donut } from '../../components/ui'

const CATS = ['SEEDS', 'FERTILIZER', 'PESTICIDE', 'LABOUR', 'IRRIGATION', 'EQUIPMENT', 'TRANSPORT', 'OTHER']
const COLORS = ['#f97316', '#a3e635', '#facc15', '#e879f9', '#38bdf8', '#fb7185', '#fb923c', '#bef264']
const today = () => new Date().toISOString().slice(0, 10)
const BLANK = () => ({ category: 'SEEDS', title: '', amount: '', expenseDate: today(), cropId: '', notes: '' })

/** Farmer's expense book + profit summary (sales of delivered orders minus expenses). */
export default function Expenses() {
  const list = useAsync(() => farmerService.expenses(), [])
  const sum = useAsync(() => farmerService.expenseSummary(), [])
  const crops = useAsync(() => farmerService.crops(''), [])
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()
  const reloadAll = () => { list.reload(); sum.reload() }

  const save = async () => {
    if (!form.title.trim()) return setErr('Please enter what you spent on')
    if (!form.amount || Number(form.amount) <= 0) return setErr('Enter a valid amount')
    const body = { ...form, amount: Number(form.amount), cropId: form.cropId ? Number(form.cropId) : null }
    try { form.id ? await farmerService.updateExpense(form.id, body) : await farmerService.createExpense(body); toast.success('Expense saved'); setForm(null); reloadAll() } catch (e) { setErr(e.message) }
  }
  const remove = async () => { try { await farmerService.deleteExpense(del.id); toast.success('Expense deleted'); setDel(null); reloadAll() } catch (e) { toast.error(e.message); setDel(null) } }

  if (list.loading || sum.loading) return <Spinner />
  const s = sum.data || { monthly: [], byCategory: [] }
  const max = Math.max(1, ...s.monthly.flatMap((m) => [Number(m.sales), Number(m.expenses)]))
  const profit = Number(s.profit)

  return (
    <>
      <div className="page-head"><div><h2>Expenses &amp; profit</h2><p>Track what you spend on the farm and see your real profit.</p></div>
        <button className="btn btn-primary" onClick={() => { setErr(''); setForm(BLANK()) }}>+ Add expense</button></div>
      <ErrorBox message={list.error || sum.error} />

      <div className="stat-grid">
        <Stat icon="💰" value={money(s.totalSales)} text="Sales (delivered orders)" tone="green" />
        <Stat icon="🧾" value={money(s.totalExpenses)} text="Total expenses" tone="red" />
        <Stat icon={profit >= 0 ? '📈' : '📉'} value={<span className={profit >= 0 ? 'profit-pos' : 'profit-neg'}>{money(profit)}</span>} text="Net profit" tone="amber" />
        <Stat icon="%" value={Number(s.marginPercent).toFixed(1) + '%'} text="Profit margin" tone="purple" />
      </div>

      <div className="two-col mb">
        <div className="card">
          <h3>Sales vs expenses (6 months)</h3>
          <div className="row gap-sm small muted"><span><i className="key-dot" style={{ background: 'var(--accent)' }} />Sales</span><span><i className="key-dot" style={{ background: 'var(--primary)' }} />Expenses</span></div>
          <div className="dual-bars">
            {s.monthly.map((m) => (
              <div className="dual-col" key={m.key} title={m.month + ': sales ' + money(m.sales) + ', expenses ' + money(m.expenses)}>
                <div className="pair"><i style={{ height: (Number(m.sales) / max) * 100 + '%', background: 'var(--accent)' }} /><i style={{ height: (Number(m.expenses) / max) * 100 + '%', background: 'var(--primary)' }} /></div>
                <small>{m.month}</small>
              </div>))}
          </div>
        </div>
        <div className="card">
          <h3>Where the money goes</h3>
          {s.byCategory.length === 0 ? <p className="muted">No expenses yet.</p> :
            <Donut data={s.byCategory.map((c, i) => ({ label: label(c.label), value: Math.round(Number(c.value)), color: COLORS[i % COLORS.length] }))} />}
        </div>
      </div>

      <div className="card">
        <h3>Expense book</h3>
        {list.data.length === 0 ? <Empty icon="🧾" title="No expenses recorded" text="Add seeds, fertilizer, labour and other costs to see your profit." /> : (
          <div className="table-wrap"><table className="tbl">
            <thead><tr><th>Date</th><th>Expense</th><th>Category</th><th>Crop</th><th className="right">Amount</th><th></th></tr></thead>
            <tbody>{list.data.map((e) => (
              <tr key={e.id}><td>{dateOnly(e.expenseDate)}</td><td><b>{e.title}</b>{e.notes && <div className="muted small">{e.notes}</div>}</td>
                <td><span className="badge b-gray">{label(e.category)}</span></td><td>{e.cropName || '—'}</td><td className="right bold">{money(e.amount)}</td>
                <td><div className="row gap-sm" style={{ flexWrap: 'nowrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setForm({ ...BLANK(), ...e, cropId: e.cropId || '', notes: e.notes || '' }) }}>Edit</button>
                  <button className="btn btn-danger-outline btn-sm" onClick={() => setDel(e)}>🗑</button></div></td></tr>))}</tbody>
          </table></div>)}
      </div>

      {form && (
        <Modal title={form.id ? 'Edit expense' : 'Add expense'} onClose={() => setForm(null)} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <ErrorBox message={err} />
          <div className="form-grid">
            <Field label="What did you spend on? *" full><input className="input" value={form.title} maxLength={150} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Hybrid tomato seeds" /></Field>
            <Field label="Category"><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c} value={c}>{label(c)}</option>)}</select></Field>
            <Field label="Amount (₹) *"><input className="input" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            <Field label="Date"><input className="input" type="date" max={today()} value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></Field>
            <Field label="Linked crop (optional)"><select className="input" value={form.cropId} onChange={(e) => setForm({ ...form, cropId: e.target.value })}><option value="">— none —</option>{(crops.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Notes" full><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>
        </Modal>)}
      {del && <ConfirmDialog title="Delete expense?" message={'Remove "' + del.title + '" (' + money(del.amount) + ')?'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
