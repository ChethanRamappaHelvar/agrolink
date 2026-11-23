import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '../context/ToastContext'
import { Field, ErrorBox } from '../components/ui'

/** Two steps: 1) enter email -> get a reset code, 2) enter code + new password. Also used by admin (prop admin). */
export default function ForgotPassword({ admin = false, forgotFn, resetFn }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const loginPath = admin ? '/admin/login' : '/login'
  const doForgot = forgotFn || authService.forgot
  const doReset = resetFn || authService.reset

  const send = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { const r = await doForgot(email); setInfo(r); if (r.resetToken) setCode(r.resetToken); setStep(2) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const reset = async (e) => {
    e.preventDefault(); setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setBusy(true)
    try { await doReset(code, password); toast.success('Password reset. Please log in.'); navigate(loginPath) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="auth-form" style={{ minHeight: '80vh' }}>
      <div className="auth-card card">
        <h2>Forgot password</h2>
        <p className="soft mb">{step === 1 ? 'Enter your registered email to get a reset code.' : 'Enter the reset code and choose a new password.'}</p>
        <ErrorBox message={error} />
        {step === 1 ? (
          <form onSubmit={send}>
            <Field label="Email"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait...' : 'Get reset code'}</button>
          </form>
        ) : (
          <form onSubmit={reset}>
            {info?.resetToken
              ? <div className="alert alert-info">Demo mode (no email server): your reset code is <b>{info.resetToken}</b>. It is filled in for you.</div>
              : <div className="alert alert-warn">{info?.message}</div>}
            <Field label="Reset code"><input className="input" value={code} onChange={(e) => setCode(e.target.value)} required /></Field>
            <Field label="New password"><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait...' : 'Reset password'}</button>
          </form>
        )}
        <p className="center mt"><Link to={loginPath} style={{ color: 'var(--primary)', fontWeight: 600 }}>← Back to login</Link></p>
      </div>
    </div>
  )
}
