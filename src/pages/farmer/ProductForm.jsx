import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { farmerService } from '../../services/farmerService'
import { publicService } from '../../services/publicService'
import { imageSrc } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { Field, ErrorBox, Spinner } from '../../components/ui'

const UNITS = ['kg', 'gram', 'quintal', 'dozen', 'piece', 'litre', 'packet', 'bag']
const QUALITY = ['Premium', 'Grade A', 'Grade B', 'Organic', 'Fresh', 'Standard']
const BLANK = { name: '', description: '', categoryId: '', price: '', unit: 'kg', quality: 'Grade A', harvestDate: '', expiryDate: '', imageUrl: '', quantity: '', lowStockThreshold: 10 }

/** Add or edit a product (route /farmer/products/new or /farmer/products/:id) */
export default function ProductForm() {
  const { id } = useParams()
  const isEdit = !!id
  const [f, setF] = useState(BLANK)
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)                // useRef: gives access to the hidden file input
  const navigate = useNavigate()
  const toast = useToast()
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value })

  useEffect(() => { publicService.categories().then(setCats) }, [])
  useEffect(() => {
    if (!isEdit) return
    farmerService.product(id).then((p) => setF({
      name: p.name, description: p.description || '', categoryId: p.categoryId, price: p.price, unit: p.unit, quality: p.quality || '',
      harvestDate: p.harvestDate || '', expiryDate: p.expiryDate || '', imageUrl: p.imageUrl || '', quantity: p.stock, lowStockThreshold: p.lowStockThreshold,
    })).catch((e) => setErr(e.message)).finally(() => setLoading(false))
  }, [id, isEdit])

  const pickImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setErr('Image must be smaller than 5 MB')
    setUploading(true); setErr('')
    try { const r = await farmerService.uploadImage(file); setF((x) => ({ ...x, imageUrl: r.url })) } catch (e2) { setErr(e2.message) } finally { setUploading(false) }
  }

  const save = async (e) => {
    e.preventDefault(); setErr('')
    if (!f.name.trim()) return setErr('Product name is required')
    if (!f.categoryId) return setErr('Please select a category')
    if (!(Number(f.price) > 0)) return setErr('Price must be greater than 0')
    if (f.quantity === '' || Number(f.quantity) < 0) return setErr('Enter the available quantity')
    if (f.harvestDate && f.expiryDate && f.expiryDate < f.harvestDate) return setErr('Expiry date cannot be before the harvest date')
    setBusy(true)
    const body = { ...f, categoryId: Number(f.categoryId), price: Number(f.price), quantity: Number(f.quantity), lowStockThreshold: Number(f.lowStockThreshold) || 10,
      harvestDate: f.harvestDate || null, expiryDate: f.expiryDate || null, imageUrl: f.imageUrl || null }
    try {
      isEdit ? await farmerService.updateProduct(id, body) : await farmerService.createProduct(body)
      toast.success(isEdit ? 'Product updated' : 'Product added. It will be visible after admin approval.')
      navigate('/farmer/products')
    } catch (e2) { setErr(e2.message); setBusy(false) }
  }

  if (loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><Link to="/farmer/products" className="muted small">← Products</Link><h2>{isEdit ? 'Edit product' : 'Add new product'}</h2></div></div>
      <form className="two-col" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start' }} onSubmit={save}>
        <div className="card">
          <ErrorBox message={err} />
          <div className="form-grid">
            <Field label="Product name *" full><input className="input" name="name" value={f.name} onChange={set} placeholder="e.g. Organic Tomatoes" /></Field>
            <Field label="Category *"><select className="input" name="categoryId" value={f.categoryId} onChange={set}><option value="">Select category</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></Field>
            <Field label="Quality"><select className="input" name="quality" value={f.quality} onChange={set}>{QUALITY.map((q) => <option key={q}>{q}</option>)}</select></Field>
            <Field label="Price (₹) *"><input className="input" type="number" min="0" step="0.01" name="price" value={f.price} onChange={set} /></Field>
            <Field label="Unit *"><select className="input" name="unit" value={f.unit} onChange={set}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></Field>
            <Field label="Available quantity *"><input className="input" type="number" min="0" name="quantity" value={f.quantity} onChange={set} /></Field>
            <Field label="Low-stock alert level" hint="You get a notification at or below this quantity"><input className="input" type="number" min="0" name="lowStockThreshold" value={f.lowStockThreshold} onChange={set} /></Field>
            <Field label="Harvest date"><input className="input" type="date" name="harvestDate" value={f.harvestDate} onChange={set} /></Field>
            <Field label="Best before / expiry"><input className="input" type="date" name="expiryDate" value={f.expiryDate} onChange={set} /></Field>
            <Field label="Description" full><textarea className="input" name="description" value={f.description} onChange={set} placeholder="Describe freshness, farming method, taste..." /></Field>
          </div>
        </div>
        <div>
          <div className="card mb">
            <h3>Product photo</h3>
            <div className="pimg" style={{ borderRadius: 12, marginBottom: 12 }}>{f.imageUrl ? <img src={imageSrc(f.imageUrl)} alt="" /> : '📷'}</div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pickImage} />
            <button type="button" className="btn btn-outline btn-block" disabled={uploading} onClick={() => fileRef.current.click()}>{uploading ? 'Uploading...' : f.imageUrl ? 'Change photo' : 'Upload photo'}</button>
            <p className="muted small mt">JPG, PNG or WEBP up to 5 MB. Without a photo, the category icon is shown.</p>
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}</button>
          <p className="muted small mt">New and edited-after-rejection products are sent to admin for approval before buyers can see them.</p>
        </div>
      </form>
    </>
  )
}
