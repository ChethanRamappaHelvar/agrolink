import { useState } from 'react'
import { Link } from 'react-router-dom'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { money } from '../../utils/format'
import { Badge, Empty, Spinner, ConfirmDialog, Thumb } from '../../components/ui'

export default function Products() {
  const { data, loading, reload } = useAsync(() => farmerService.products(), [])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [del, setDel] = useState(null)
  const toast = useToast()

  const toggle = async (p) => { await farmerService.setActive(p.id, !p.active); toast.success(p.active ? 'Product deactivated' : 'Product activated'); reload() }
  const remove = async () => {
    const r = await farmerService.deleteProduct(del.id)
    toast.success(r.message); setDel(null); reload()
  }

  if (loading) return <Spinner />
  const list = data.filter((p) => (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filter || (filter === 'ACTIVE' ? p.active : filter === 'OUT' ? p.stock <= 0 : p.approvalStatus === filter)))

  return (
    <>
      <div className="page-head"><div><h2>My products</h2><p>{data.length} listing(s). Buyers only see products approved by admin.</p></div><Link to="/farmer/products/new" className="btn btn-primary">+ Add product</Link></div>
      <div className="toolbar">
        <input className="input" placeholder="🔍 Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All products</option><option value="ACTIVE">Switched on</option><option value="PENDING">Pending approval</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="OUT">Out of stock</option>
        </select>
      </div>
      {list.length === 0 ? <div className="card"><Empty icon="🥕" title="No products found"><Link to="/farmer/products/new" className="btn btn-primary">Add your first product</Link></Empty></div> : (
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Approval</th><th>Listing</th><th></th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id}>
              <td><div className="prod"><Thumb url={p.imageUrl} icon={p.categoryIcon} /><div><b>{p.name}</b><div className="muted small">{p.productCode} · {p.categoryName}</div></div></div></td>
              <td>{money(p.price)} / {p.unit}</td>
              <td>{p.stock <= 0 ? <Badge status="OUT" /> : <span>{p.stock} {p.unit}{p.stock <= p.lowStockThreshold && <> <Badge status="LOW" /></>}</span>}</td>
              <td><Badge status={p.approvalStatus} />{p.rejectionReason && <div className="small" style={{ color: 'var(--danger)', maxWidth: 200 }}>{p.rejectionReason}</div>}</td>
              <td><label className="row small gap-sm" style={{ cursor: 'pointer' }}><input type="checkbox" checked={p.active} onChange={() => toggle(p)} />{p.active ? 'Active' : 'Off'}</label></td>
              <td><div className="row gap-sm" style={{ flexWrap: 'nowrap' }}><Link className="btn btn-outline btn-sm" to={'/farmer/products/' + p.id}>Edit</Link><button className="btn btn-danger-outline btn-sm" onClick={() => setDel(p)}>Delete</button></div></td>
            </tr>))}</tbody>
        </table></div>)}
      {del && <ConfirmDialog title="Delete product?" message={'Delete "' + del.name + '"? If it already has orders it will only be deactivated.'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
