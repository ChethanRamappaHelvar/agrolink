import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { dateTime } from '../../utils/format'
import { Badge, Empty, Spinner } from '../../components/ui'

export default function MyComplaints() {
  const { data, loading } = useAsync(() => buyerService.complaints(), [])
  if (loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><h2>My complaints</h2><p>To raise a new one, open an order and choose “Report a problem”.</p></div></div>
      {data.length === 0 ? <div className="card"><Empty icon="🛠️" title="No complaints" text="Everything fine? Great!" /></div> :
        data.map((c) => (
          <div className="card mb" key={c.id}>
            <div className="row between"><div><b>{c.subject}</b><div className="muted small">{c.complaintCode} {c.orderCode && '· Order ' + c.orderCode} · {dateTime(c.createdAt)}</div></div><Badge status={c.status} /></div>
            <p className="soft mt">{c.description}</p>
            {c.adminResponse && <div className="alert alert-info mt"><b>Support response:</b> {c.adminResponse}</div>}
            {c.resolution && <div className="alert alert-ok"><b>Resolution:</b> {c.resolution}</div>}
          </div>))}
    </>
  )
}
