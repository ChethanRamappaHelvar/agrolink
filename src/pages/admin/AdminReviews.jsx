import { useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { dateOnly } from '../../utils/format'
import { Empty, Stars, ConfirmDialog, HBars } from '../../components/ui'
import { usePagedList, ListState, Select } from '../../components/admin/AdminBits'

export default function AdminReviews() {
  const [search, setSearch] = useState('')
  const [reported, setReported] = useState(false)
  const [rating, setRating] = useState('')
  const [del, setDel] = useState(null)
  const toast = useToast()
  const list = usePagedList(adminService.reviews, { search, reported, rating })
  const ratings = useAsync(() => adminService.productRatings(), [])

  const remove = async (reason) => {
    try { await adminService.removeReview(del.id, reason); toast.success('Review removed'); setDel(null); list.reload(); ratings.reload() } catch (e) { toast.error(e.message); setDel(null) }
  }
  const dismiss = async (r) => { try { await adminService.dismissReport(r.id); toast.success('Report dismissed'); list.reload() } catch (e) { toast.error(e.message) } }

  return (
    <>
      <div className="page-head"><div><h2>Reviews & ratings</h2><p>Moderate customer feedback and handle reports from farmers.</p></div></div>
      {ratings.data && ratings.data.length > 0 && <div className="card mb"><h3>Top rated products</h3><HBars data={ratings.data.slice(0, 5).map((r) => ({ label: r.productName + ' (' + r.reviewCount + ')', value: r.avgRating, color: 'var(--amber)' }))} format={(v) => v + ' ★'} /></div>}
      <div className="toolbar">
        <input className="input" placeholder="🔍 Search review text, product or customer" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <Select value={rating} onChange={setRating} options={[['5', '5 stars'], ['4', '4 stars'], ['3', '3 stars'], ['2', '2 stars'], ['1', '1 star']]} all="Any rating" />
        <label className="row small gap-sm"><input type="checkbox" checked={reported} onChange={(e) => setReported(e.target.checked)} /> 🚩 Reported only</label>
      </div>
      <ListState list={list}>
        {list.data?.items.length === 0 ? <div className="card"><Empty icon="⭐" title="No reviews found" /></div> : list.data?.items.map((r) => (
          <div className="card mb" key={r.id} style={r.reported ? { borderColor: 'var(--rose)' } : {}}>
            <div className="row between"><div><b>{r.productName}</b> <span className="muted small">by farmer {r.farmerName}</span></div><span className="muted small">{dateOnly(r.createdAt)}</span></div>
            <div className="row"><Stars value={r.rating} /><span className="soft small">{r.customerName} ({r.customerCode})</span></div>
            {r.comment && <p className="soft mt">{r.comment}</p>}
            {r.reported && <div className="alert alert-error mt">🚩 Reported by the farmer: {r.reportReason}</div>}
            <div className="row mt">{r.reported && <button className="btn btn-outline btn-sm" onClick={() => dismiss(r)}>Dismiss report</button>}<button className="btn btn-danger-outline btn-sm" onClick={() => setDel(r)}>Remove review</button></div>
          </div>))}
      </ListState>
      {del && <ConfirmDialog title="Remove this review?" message="The customer is notified. This cannot be undone." danger askReason reasonLabel="Reason" confirmText="Remove" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
