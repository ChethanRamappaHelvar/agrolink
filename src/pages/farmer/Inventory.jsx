import { useState } from 'react'
import { farmerService } from '../../services/farmerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { dateTime } from '../../utils/format'
import { Badge, Empty, Spinner, Modal, Field, ErrorBox, Thumb } from '../../components/ui'

export default function Inventory() {
  const [tab, setTab] = useState('stock')
  const [filter, setFilter] = useState('')
  const stock = useAsync(() => farmerService.inventory(), [])
  const history = useAsync(() => farmerService.inventoryHistory(), [])
  const [edit, setEdit] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()

  const save = async () => {
    if (edit.quantity === '' || Number(edit.quantity) < 0) return setErr('Enter a valid quantity')
    try {
      await farmerService.updateInventory(edit.productId, { quantity: Number(edit.quantity), lowStockThreshold: Number(edit.lowStockThreshold), note: edit.note })
      toast.success('Stock updated'); setEdit(null); stock.reload(); history.reload()
    } catch (e) { setErr(e.message) }
  }

  if (stock.loading) return <Spinner />
  const rows = stock.data.filter((r) => !filter || r.stockStatus === filter)
  const count = (s) => stock.data.filter((r) => r.stockStatus === s).length

  return (
    <>
      <div className="page-head"><div><h2>Inventory</h2><p>Stock reduces automatically when orders are placed and returns when they are cancelled.</p></div></div>
      <div className="tabs">{[['stock', '📦 Current stock'], ['history', '🕘 Inventory history']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}</div>
      {tab === 'stock' && (
        <>
          <div className="chip-list mb">
            <button className={'chip' + (!filter ? ' on' : '')} onClick={() => setFilter('')}>All ({stock.data.length})</button>
            <button className={'chip' + (filter === 'OK' ? ' on' : '')} onClick={() => setFilter('OK')}>Available ({count('OK')})</button>
            <button className={'chip' + (filter === 'LOW' ? ' on' : '')} onClick={() => setFilter('LOW')}>Low stock ({count('LOW')})</button>
            <button className={'chip' + (filter === 'OUT' ? ' on' : '')} onClick={() => setFilter('OUT')}>Out of stock ({count('OUT')})</button>
          </div>
          {rows.length === 0 ? <div className="card"><Empty icon="📦" title="Nothing here" /></div> : (
            <div className="table-wrap"><table className="tbl">
              <thead><tr><th>Product</th><th>In stock</th><th>Alert level</th><th>Status</th><th>Updated</th><th></th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.productId}><td><div className="prod"><Thumb url={r.imageUrl} icon={r.categoryIcon} /><div><b>{r.name}</b><div className="muted small">{r.productCode}</div></div></div></td>
                  <td><b>{r.quantity}</b> {r.unit}</td><td>{r.lowStockThreshold}</td><td><Badge status={r.stockStatus} text={r.stockStatus === 'OK' ? 'Available' : r.stockStatus === 'LOW' ? 'Low stock' : 'Out of stock'} /></td>
                  <td className="muted small">{dateTime(r.updatedAt)}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setEdit({ ...r, note: '' }) }}>Update stock</button></td></tr>))}</tbody>
            </table></div>)}
        </>)}
      {tab === 'history' && (history.loading ? <Spinner /> : (history.data || []).length === 0 ? <div className="card"><Empty icon="🕘" title="No history yet" /></div> : (
        <div className="table-wrap"><table className="tbl"><thead><tr><th>When</th><th>Product</th><th>Change</th><th>Balance</th><th>Reason</th></tr></thead>
          <tbody>{history.data.map((h) => (<tr key={h.id}><td className="muted small">{dateTime(h.createdAt)}</td><td><b>{h.productName}</b></td>
            <td><span className={'badge ' + (h.change >= 0 ? 'b-green' : 'b-red')}>{h.change > 0 ? '+' : ''}{h.change} {h.unit}</span></td><td>{h.balanceAfter}</td><td className="soft">{h.reason}</td></tr>))}</tbody></table></div>))}
      {edit && (
        <Modal title={'Update stock: ' + edit.name} size="sm" onClose={() => setEdit(null)} footer={<><button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <ErrorBox message={err} />
          <Field label={'Quantity in stock (' + edit.unit + ')'}><input className="input" type="number" min="0" value={edit.quantity} onChange={(e) => setEdit({ ...edit, quantity: e.target.value })} /></Field>
          <Field label="Low-stock alert level"><input className="input" type="number" min="0" value={edit.lowStockThreshold} onChange={(e) => setEdit({ ...edit, lowStockThreshold: e.target.value })} /></Field>
          <Field label="Note (optional)"><input className="input" value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} placeholder="e.g. New harvest arrived" /></Field>
        </Modal>)}
    </>
  )
}
