import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { authService } from '../../services/authService'
import { Field, ErrorBox, Badge } from '../../components/ui'
import { INDIAN_STATES, dateOnly } from '../../utils/format'

/** Profile + change password for farmer, buyer and admin. */
export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    name: user.name || '', phone: user.phone || '', location: user.location || '', state: user.state || '',
    bio: user.bio || '', experienceYears: user.experienceYears ?? '',
  })
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [err, setErr] = useState('')
  const [pwErr, setPwErr] = useState('')
  const isFarmer = user.role === 'FARMER'
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async (e) => {
    e.preventDefault(); setErr('')
    if (form.name.trim().length < 2) return setErr('Name is required')
    if (form.phone && !/^\d{10}$/.test(form.phone)) return setErr('Phone number must be 10 digits')
    try {
      await authService.updateProfile({ ...form, experienceYears: form.experienceYears === '' ? null : Number(form.experienceYears) })
      await refresh()
      toast.success('Profile updated')
    } catch (e2) { setErr(e2.message) }
  }

  const savePw = async (e) => {
    e.preventDefault(); setPwErr('')
    if (pw.newPassword.length < 6) return setPwErr('New password must be at least 6 characters')
    if (pw.newPassword !== pw.confirm) return setPwErr('New passwords do not match')
    try {
      await authService.changePassword({ oldPassword: pw.oldPassword, newPassword: pw.newPassword })
      setPw({ oldPassword: '', newPassword: '', confirm: '' })
      toast.success('Password changed')
    } catch (e2) { setPwErr(e2.message) }
  }

  const pct = user.profileCompletion
  return (
    <>
      <div className="page-head"><div><h2>My profile</h2><p>{user.userCode} · {user.email} · Member since {dateOnly(user.createdAt)}</p></div>
        <div className="row"><Badge status={user.status} />{isFarmer && <Badge status={user.verificationStatus} text={'Verification: ' + user.verificationStatus} />}</div></div>
      {pct !== undefined && (
        <div className="card mb">
          <div className="row between"><b>Profile completion</b><b>{pct}%</b></div>
          <div className="progress mt"><div style={{ width: pct + '%' }} /></div>
          {pct < 100 && <p className="muted small mt">{isFarmer ? 'Add your phone, bio, experience, a farm and a product to reach 100%.' : 'Add your phone number and a delivery address to reach 100%.'}</p>}
        </div>
      )}
      {isFarmer && user.verificationRemark && <div className="alert alert-warn">Admin remark: {user.verificationRemark}</div>}
      <div className="two-col" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <form className="card" onSubmit={save}>
          <h3>Personal information</h3>
          <ErrorBox message={err} />
          <div className="form-grid">
            <Field label="Full name"><input className="input" name="name" value={form.name} onChange={change} /></Field>
            <Field label="Phone"><input className="input" name="phone" value={form.phone} onChange={change} maxLength={10} /></Field>
            {isFarmer && <>
              <Field label="Village / Town"><input className="input" name="location" value={form.location} onChange={change} /></Field>
              <Field label="State"><select className="input" name="state" value={form.state} onChange={change}><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Experience (years)"><input className="input" type="number" min="0" name="experienceYears" value={form.experienceYears} onChange={change} /></Field>
              <Field label="About you" full><textarea className="input" name="bio" value={form.bio} onChange={change} placeholder="Tell buyers about your farm..." /></Field>
            </>}
          </div>
          <button className="btn btn-primary">Save changes</button>
        </form>
        <form className="card" onSubmit={savePw}>
          <h3>Change password</h3>
          <ErrorBox message={pwErr} />
          <Field label="Current password"><input className="input" type="password" value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} /></Field>
          <Field label="New password"><input className="input" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
          <Field label="Confirm new password"><input className="input" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
          <button className="btn btn-outline">Update password</button>
        </form>
      </div>
    </>
  )
}
