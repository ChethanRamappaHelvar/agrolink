import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Field, ErrorBox } from '../../components/ui'

/** Separate admin sign-in screen (dark theme, no link to the public site login). */
export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.email.trim() || !form.password) return setError('Please enter your email and password')
    setBusy(true)
    try { await login(form.email, form.password, true); navigate('/admin', { replace: true }) }
    catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(560px 560px at 0% 0%, rgba(249,115,22,.35), transparent 70%), radial-gradient(480px 480px at 100% 100%, rgba(163,230,53,.22), transparent 70%), #120d0b', padding: 20 }}>
      <form className="card" style={{ width: '100%', maxWidth: 420, padding: 34 }} onSubmit={submit}>
        <div className="logo" style={{ marginBottom: 6 }}><span className="mark" style={{ background: 'linear-gradient(135deg,#f97316,#a3e635)' }}>🛡️</span><span>Agro<b>Link</b> Admin</span></div>
        <p className="soft mb">Authorised administrators only.</p>
        <ErrorBox message={error} />
        <Field label="Admin email"><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus /></Field>
        <Field label="Password"><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <div className="right mb"><Link to="/admin/forgot-password" className="small" style={{ color: 'var(--primary-soft)', fontWeight: 600 }}>Forgot password?</Link></div>
        <button className="btn btn-block" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }} disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        <div className="demo-box">Demo admin: <code>admin@agri.com</code> / <code>Admin@123</code></div>
        <p className="center small mt"><Link to="/" className="muted">← Back to website</Link></p>
      </form>
    </div>
  )
}
