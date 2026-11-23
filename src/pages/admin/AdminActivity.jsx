import { useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { dateTime, label } from '../../utils/format'
import { Empty, Spinner, ErrorBox } from '../../components/ui'
import { downloadCsv } from '../../components/admin/AdminBits'

const ACTIONS = ['LOGIN', 'FARMER_VERIFICATION', 'PRODUCT_', 'ACCOUNT_', 'COMPLAINT_', 'CATEGORY_', 'REVIEW_', 'NOTIFICATION', 'ADMIN_']

export default function AdminActivity() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { data, loading, error } = useAsync(() => adminService.activity({ search, action, from, to }), [search, action, from, to])

  return (
    <>
      <div className="page-head"><div><h2>Admin activity log</h2><p>Every important administrative action is recorded here.</p></div>
        {data && <button className="btn btn-outline btn-sm" onClick={() => downloadCsv('admin-activity.csv', ['createdAt', 'adminName', 'action', 'targetType', 'targetId', 'details'], data)}>⬇ Export CSV</button>}</div>
      <div className="toolbar">
        <input className="input" placeholder="🔍 Search details, ID or admin" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={action} onChange={(e) => setAction(e.target.value)}><option value="">All actions</option>{ACTIONS.map((a) => <option key={a} value={a}>{label(a)}</option>)}</select>
        <label className="row small gap-sm">From <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 150 }} /></label>
        <label className="row small gap-sm">To <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 150 }} /></label>
      </div>
      <ErrorBox message={error} />
      {loading ? <Spinner /> : !data || data.length === 0 ? <div className="card"><Empty icon="🕘" title="No activity found" /></div> : (
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
          <tbody>{data.map((a) => <tr key={a.id}><td className="muted small" style={{ whiteSpace: 'nowrap' }}>{dateTime(a.createdAt)}</td><td><b>{a.adminName}</b><div className="muted small">{a.adminCode}</div></td>
            <td><span className="badge b-gray">{label(a.action)}</span></td><td>{a.targetType} <span className="muted small">{a.targetId}</span></td><td className="soft small">{a.details}</td></tr>)}</tbody>
        </table></div>)}
    </>
  )
}
