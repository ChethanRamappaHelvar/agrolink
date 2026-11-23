import { useState } from 'react'
import { buyerService } from '../../services/buyerService'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { Empty, Spinner, ConfirmDialog } from '../../components/ui'
import AddressForm from '../../components/AddressForm'

export default function Addresses() {
  const { data, loading, reload } = useAsync(() => buyerService.addresses(), [])
  const [edit, setEdit] = useState(undefined)      // undefined = closed, null = new, object = editing
  const [del, setDel] = useState(null)
  const toast = useToast()

  const remove = async () => { await buyerService.deleteAddress(del.id); toast.success('Address deleted'); setDel(null); reload() }
  if (loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><h2>Delivery addresses</h2><p>Manage where your orders are delivered.</p></div><button className="btn btn-primary" onClick={() => setEdit(null)}>+ Add address</button></div>
      {data.length === 0 ? <div className="card"><Empty icon="📍" title="No addresses saved" /></div> : (
        <div className="three-col" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {data.map((a) => (
            <div className="card" key={a.id}>
              <div className="row between"><span className="badge b-gray">{a.label}</span>{a.defaultAddress && <span className="badge b-green">Default</span>}</div>
              <h3 style={{ margin: '10px 0 4px' }}>{a.fullName}</h3>
              <p className="soft small">{a.line1}{a.line2 ? ', ' + a.line2 : ''}<br />{a.city}, {a.state} - {a.pincode}<br />📞 {a.phone}</p>
              <div className="row mt"><button className="btn btn-outline btn-sm" onClick={() => setEdit(a)}>Edit</button><button className="btn btn-danger-outline btn-sm" onClick={() => setDel(a)}>Delete</button></div>
            </div>))}
        </div>)}
      {edit !== undefined && <AddressForm address={edit} onClose={() => setEdit(undefined)} onSaved={() => { setEdit(undefined); toast.success('Address saved'); reload() }} />}
      {del && <ConfirmDialog title="Delete address?" message={'Remove the address of ' + del.fullName + '?'} danger confirmText="Delete" onConfirm={remove} onClose={() => setDel(null)} />}
    </>
  )
}
