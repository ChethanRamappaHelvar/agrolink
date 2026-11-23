import { useEffect, useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { money, label } from '../../utils/format'
import { Badge, Empty, Spinner, ErrorBox } from '../../components/ui'
import { downloadCsv } from '../../components/admin/AdminBits'

const REPORTS = [
  ['registrations', '👥 Registrations', true], ['categories', '🗂️ Product categories', false], ['approvals', '✅ Product approvals', true],
  ['orders', '🧾 Orders', true], ['sales', '💰 Sales', true], ['monthly-sales', '📅 Monthly sales', true], ['farmer-sales', '👨‍🌾 Farmer-wise sales', true],
  ['customer-activity', '🛍️ Customer activity', true], ['complaints', '🛠️ Complaints', true], ['inventory', '📦 Inventory & stock', false],
]
const MONEY = ['amount', 'sales', 'revenue', 'spent']
const STATUS = ['status', 'stockStatus', 'decision']

export default function AdminReports() {
  const [type, setType] = useState('registrations')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const cur = REPORTS.find((r) => r[0] === type)

  useEffect(() => {
    setData(null); setError('')
    adminService.report(type, { from, to }).then(setData).catch((e) => setError(e.message))
  }, [type, from, to])

  const cell = (col, v) => {
    if (v === null || v === undefined || v === '') return '-'
    if (STATUS.includes(col)) return <Badge status={String(v)} />
    if (MONEY.includes(col) && !isNaN(v)) return money(v)
    return String(v)
  }

  return (
    <>
      <div className="page-head"><div><h2>Reports & analytics</h2><p>Filter by date and export any report to Excel (CSV).</p></div></div>
      <div className="chip-list mb">{REPORTS.map(([k, t]) => <button key={k} className={'chip' + (type === k ? ' on' : '')} onClick={() => setType(k)}>{t}</button>)}</div>
      <div className="toolbar">
        {cur[2] ? <>
          <label className="row small gap-sm">From <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 160 }} /></label>
          <label className="row small gap-sm">To <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 160 }} /></label>
          {(from || to) && <button className="btn btn-ghost btn-sm" onClick={() => { setFrom(''); setTo('') }}>Clear dates</button>}
        </> : <span className="muted small">This report shows the current position (no date filter).</span>}
        <div className="grow" />
        {data && <button className="btn btn-outline btn-sm" onClick={() => downloadCsv(type + '-report.csv', data.columns, data.rows)}>⬇ Export CSV</button>}
        {data && <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>🖨 Print</button>}
      </div>
      <ErrorBox message={error} />
      {!data && !error ? <Spinner /> : data && (
        <>
          <div className="stat-grid">
            {Object.entries(data.summary).map(([k, v]) => (
              <div className="stat" key={k}><div className="ico ico-green">📊</div><div><b>{MONEY.some((m) => k.toLowerCase().includes(m)) || /value|sales|amount/i.test(k) ? money(v) : String(v)}</b><span>{label(k.replace(/([A-Z])/g, ' $1'))}</span></div></div>))}
          </div>
          <h3 className="mb">{data.title}</h3>
          {data.rows.length === 0 ? <div className="card"><Empty icon="📈" title="No data for this period" /></div> : (
            <div className="table-wrap"><table className="tbl">
              <thead><tr>{data.columns.map((c) => <th key={c}>{label(c.replace(/([A-Z])/g, ' $1'))}</th>)}</tr></thead>
              <tbody>{data.rows.map((r, i) => <tr key={i}>{data.columns.map((c) => <td key={c}>{cell(c, r[c])}</td>)}</tr>)}</tbody>
            </table></div>)}
        </>)}
    </>
  )
}
