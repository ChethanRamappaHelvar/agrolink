import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { dateOnly } from '../../utils/format'
import { Empty, Spinner, Stars, Modal, RatingInput, Field, ConfirmDialog, ErrorBox } from '../../components/ui'

export default function MyReviews() {
  const { data, loading, reload } = useAsync(() => buyerService.myReviews(), [])
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()

  const save = async () => {
    try { await buyerService.updateReview(edit.id, { rating: edit.rating, comment: edit.comment }); toast.success('Review updated'); setEdit(null); reload() } catch (e) { setErr(e.message) }
  }
  const remove = async () => { await buyerService.deleteReview(del.id); toast.success('Review deleted'); setDel(null); reload() }

  if (loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><h2>My reviews</h2><p>Products you have rated. You can review a product after it is delivered.</p></div></div>
      {data.length === 0 ? <div className="card"><Empty icon="⭐" title="No reviews yet" text="Open a delivered order to review its products."><Link className="btn btn-primary" to="/buyer/orders">Go to my orders</Link></Empty></div> :
        data.map((r) => (
          <div className="card mb" key={r.id}>
            <div className="row between"><Link to={'/product/' + r.productId}><b>{r.productName}</b></Link><span className="muted small">{dateOnly(r.updatedAt)}</span></div>
            <Stars value={r.rating} />{r.comment && <p className="soft mt">{r.comment}</p>}
            <div className="row mt"><button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setEdit({ ...r }) }}>Edit</button><button className="btn btn-danger-outline btn-sm" onClick={() => setDel(r)}>Delete</button></div>
          </div>))}
      {edit && (
        <Modal title={'Edit review: ' + edit.productName} size="sm" onClose={() => setEdit(null)} footer={<><button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <ErrorBox message={err} />
          <Field label="Rating"><RatingInput value={edit.rating} onChange={(v) => setEdit({ ...edit, rating: v })} /></Field>
          <Field label="Review"><textarea className="input" value={edit.comment || ''} onChange={(e) => setEdit({ ...edit, comment: e.target.value })} /></Field>
        </Modal>)}
      {del && <ConfirmDialog title="Delete review?" message="Your review will be removed permanently." danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
