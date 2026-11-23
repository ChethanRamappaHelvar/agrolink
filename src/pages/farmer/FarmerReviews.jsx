import { useState } from 'react'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { dateOnly } from '../../utils/format'
import { Empty, Spinner, Stars, ConfirmDialog, Stat } from '../../components/ui'

export default function FarmerReviews() {
  const { data, loading, reload } = useAsync(() => farmerService.reviews(), [])
  const [rep, setRep] = useState(null)
  const toast = useToast()
  if (loading) return <Spinner />
  const avg = data.length ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1) : '–'

  return (
    <>
      <div className="page-head"><div><h2>Reviews on my products</h2><p>See what buyers think. You can report inappropriate reviews to the admin.</p></div></div>
      <div className="stat-grid"><Stat icon="⭐" value={avg} text="Average rating" tone="amber" /><Stat icon="💬" value={data.length} text="Total reviews" tone="blue" /></div>
      {data.length === 0 ? <div className="card"><Empty icon="⭐" title="No reviews yet" /></div> : data.map((r) => (
        <div className="card mb" key={r.id}>
          <div className="row between"><b>{r.productName}</b><span className="muted small">{r.customerName} · {dateOnly(r.createdAt)}</span></div>
          <Stars value={r.rating} />{r.comment && <p className="soft mt">{r.comment}</p>}
          <div className="mt">{r.reported ? <span className="badge b-amber">Reported to admin</span> : <button className="btn btn-ghost btn-sm" onClick={() => setRep(r)}>🚩 Report review</button>}</div>
        </div>))}
      {rep && <ConfirmDialog title="Report this review" message="Tell the admin why this review is inappropriate." askReason reasonLabel="Reason" confirmText="Report" onConfirm={async (reason) => { await farmerService.reportReview(rep.id, reason); toast.success('Reported to admin'); setRep(null); reload() }} onClose={() => setRep(null)} />}
    </>
  )
}
