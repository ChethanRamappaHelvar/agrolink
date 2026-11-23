import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '../context/ToastContext'
import { Field, ErrorBox } from '../components/ui'
import { INDIAN_STATES } from '../utils/format'

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const [role, setRole] = useState('CUSTOMER')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', location: '', state: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    if (form.name.trim().length < 2) return 'Please enter your full name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address'
    if (form.phone && !/^\d{10}$/.test(form.phone)) return 'Phone number must be 10 digits'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    if (role === 'FARMER' && (!form.location.trim() || !form.state)) return 'Farmers must enter their village/town and state'
    return ''
  }

  const submit = async (e) => {
    e.preventDefault()
    const msg = validate()
    if (msg) return setError(msg)
    setError('')
    setBusy(true)
    const { confirm, ...data } = form
    try {
      if (role === 'FARMER') await authService.registerFarmer(data)
      else await authService.registerCustomer({ ...data, location: '', state: '' })
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <h2>Join the AgroLink family 🌱</h2>
        <p>Whether you grow the food or love to eat it fresh, there is a place for you here.</p>
        <ul><li>Free registration, no middlemen</li><li>Farmers get a full farm management toolkit</li><li>Buyers get fresh produce at honest prices</li></ul>
      </div>
      <div className="auth-form">
        <form className="auth-card" onSubmit={submit}>
          <h2>Create account</h2>
          <p className="soft mb">Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Login</Link></p>
          <div className="tabs">
            <button type="button" className={role === 'CUSTOMER' ? 'on' : ''} onClick={() => setRole('CUSTOMER')}>🛍️ I want to buy</button>
            <button type="button" className={role === 'FARMER' ? 'on' : ''} onClick={() => setRole('FARMER')}>👨‍🌾 I am a farmer</button>
          </div>
          <ErrorBox message={error} />
          <Field label="Full name"><input className="input" name="name" value={form.name} onChange={change} /></Field>
          <Field label="Email"><input className="input" name="email" type="email" value={form.email} onChange={change} /></Field>
          <Field label="Phone (10 digits)"><input className="input" name="phone" value={form.phone} onChange={change} maxLength={10} /></Field>
          {role === 'FARMER' && (
            <div className="form-grid">
              <Field label="Village / Town"><input className="input" name="location" value={form.location} onChange={change} /></Field>
              <Field label="State">
                <select className="input" name="state" value={form.state} onChange={change}><option value="">Select state</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
            </div>
          )}
          <div className="form-grid">
            <Field label="Password"><input className="input" name="password" type="password" value={form.password} onChange={change} /></Field>
            <Field label="Confirm password"><input className="input" name="confirm" type="password" value={form.confirm} onChange={change} /></Field>
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account...' : 'Register'}</button>
        </form>
      </div>
    </div>
  )
}
