import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Field, ErrorBox } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })     // controlled component state
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) return setError('Please enter your email and password')
    setBusy(true)
    try {
      const user = await login(form.email, form.password)
      const home = user.role === 'FARMER' ? '/farmer' : '/buyer'
      navigate(location.state?.from && location.state.from.startsWith(home) ? location.state.from : home, { replace: true })
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const fill = (email, password) => setForm({ email, password })

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <h2>Welcome back to the field 🌾</h2>
        <p>Log in to manage your farm, track orders and shop fresh produce directly from farmers.</p>
        <ul><li>Farmers: manage crops, stock and orders</li><li>Buyers: cart, wishlist and live order tracking</li><li>Secure accounts and simple invoices</li></ul>
      </div>
      <div className="auth-form">
        <form className="auth-card" onSubmit={submit}>
          <h2>Login</h2>
          <p className="soft mb">New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create an account</Link></p>
          <ErrorBox message={error} />
          <Field label="Email"><input className="input" name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" autoFocus /></Field>
          <Field label="Password"><input className="input" name="password" type="password" value={form.password} onChange={change} placeholder="Your password" /></Field>
          <div className="right mb"><Link to="/forgot-password" className="small" style={{ color: 'var(--primary)', fontWeight: 600 }}>Forgot password?</Link></div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
          <div className="demo-box">
            <b>Demo accounts</b> (click to fill)<br />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fill('ravi@agri.com', 'Farmer@123')}>👨‍🌾 Farmer</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fill('anita@agri.com', 'Buyer@123')}>🛍️ Buyer</button>
          </div>
        </form>
      </div>
    </div>
  )
}
