import { useState } from 'react'
import { adminService } from '../../services/admin/adminService'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { dateTime, label } from '../../utils/format'
import { Badge, Spinner, Modal, Field, ErrorBox, ConfirmDialog } from '../../components/ui'

export default function AdminAccounts() {
  const { user } = useAuth()
  const admins = useAsync(() => adminService.admins(), [])
  const perms = useAsync(() => adminService.permissions(), [])
  const [create, setCreate] = useState(null)
  const [edit, setEdit] = useState(null)
  const [act, setAct] = useState(null)
  const [err, setErr] = useState('')
  const toast = useToast()
  const canManage = (user.permissions || []).includes('MANAGE_ADMINS')

  const toggle = (list, p) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p])
  const saveNew = async () => {
    if (!create.name.trim() || !create.email.trim() || create.password.length < 6) return setErr('Name, email and a password of 6+ characters are required')
    try { await adminService.createAdmin(create); toast.success('Admin created'); setCreate(null); admins.reload() } catch (e) { setErr(e.message) }
  }
  const savePerms = async () => { try { await adminService.setPermissions(edit.id, edit.permissions); toast.success('Permissions saved'); setEdit(null); admins.reload() } catch (e) { setErr(e.message) } }
  const changeStatus = async () => { try { await adminService.adminStatus(act.id, act.status); toast.success('Admin updated'); setAct(null); admins.reload() } catch (e) { toast.error(e.message); setAct(null) } }

  if (admins.loading) return <Spinner />
  return (
    <>
      <div className="page-head"><div><h2>Admin accounts</h2><p>Super admins can do everything. Other admins get only the permissions you tick.</p></div>
        {canManage && <button className="btn btn-primary" onClick={() => { setErr(''); setCreate({ name: '', email: '', password: '', adminLevel: 'ADMIN', permissions: ['VIEW_REPORTS'] }) }}>+ New admin</button>}</div>
      {!canManage && <div className="alert alert-info">You can view admin accounts, but only administrators with the MANAGE_ADMINS permission can change them.</div>}
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>Admin</th><th>Level</th><th>Permissions</th><th>Last login</th><th>Status</th><th></th></tr></thead>
        <tbody>{admins.data.map((a) => (
          <tr key={a.id}><td><b>{a.name}</b>{a.id === user.id && <span className="badge b-blue" style={{ marginLeft: 6 }}>You</span>}<div className="muted small">{a.userCode} · {a.email}</div></td>
            <td><span className={'badge ' + (a.adminLevel === 'SUPER_ADMIN' ? 'b-purple' : 'b-gray')}>{label(a.adminLevel)}</span></td>
            <td style={{ maxWidth: 320 }}>{a.adminLevel === 'SUPER_ADMIN' ? <span className="muted small">All permissions</span> : a.permissions.length === 0 ? <span className="muted small">View only</span> : a.permissions.map((p) => <span key={p} className="badge b-green" style={{ margin: 2 }}>{label(p)}</span>)}</td>
            <td className="muted small">{dateTime(a.lastLoginAt)}</td><td><Badge status={a.status} /></td>
            <td>{canManage && a.id !== user.id && <div className="row gap-sm" style={{ flexWrap: 'nowrap' }}>
              {a.adminLevel !== 'SUPER_ADMIN' && <button className="btn btn-outline btn-sm" onClick={() => { setErr(''); setEdit({ id: a.id, name: a.name, permissions: [...a.permissions] }) }}>Permissions</button>}
              <button className={'btn btn-sm ' + (a.status === 'ACTIVE' ? 'btn-danger-outline' : 'btn-outline')} onClick={() => setAct({ id: a.id, name: a.name, status: a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}>{a.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></div>}</td></tr>))}</tbody>
      </table></div>

      {create && (
        <Modal title="Create admin account" onClose={() => setCreate(null)} footer={<><button className="btn btn-ghost" onClick={() => setCreate(null)}>Cancel</button><button className="btn btn-primary" onClick={saveNew}>Create admin</button></>}>
          <ErrorBox message={err} />
          <div className="form-grid">
            <Field label="Name"><input className="input" value={create.name} onChange={(e) => setCreate({ ...create, name: e.target.value })} /></Field>
            <Field label="Email"><input className="input" type="email" value={create.email} onChange={(e) => setCreate({ ...create, email: e.target.value })} /></Field>
            <Field label="Password"><input className="input" type="password" value={create.password} onChange={(e) => setCreate({ ...create, password: e.target.value })} /></Field>
            <Field label="Level"><select className="input" value={create.adminLevel} onChange={(e) => setCreate({ ...create, adminLevel: e.target.value })}><option value="ADMIN">Admin (limited)</option><option value="SUPER_ADMIN">Super admin (everything)</option></select></Field>
          </div>
          {create.adminLevel === 'ADMIN' && <Field label="Permissions"><div className="chip-list">{(perms.data || []).map((p) => <button type="button" key={p} className={'chip' + (create.permissions.includes(p) ? ' on' : '')} onClick={() => setCreate({ ...create, permissions: toggle(create.permissions, p) })}>{label(p)}</button>)}</div></Field>}
        </Modal>)}
      {edit && (
        <Modal title={'Permissions: ' + edit.name} onClose={() => setEdit(null)} footer={<><button className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" onClick={savePerms}>Save</button></>}>
          <ErrorBox message={err} />
          <div className="chip-list">{(perms.data || []).map((p) => <button type="button" key={p} className={'chip' + (edit.permissions.includes(p) ? ' on' : '')} onClick={() => setEdit({ ...edit, permissions: toggle(edit.permissions, p) })}>{label(p)}</button>)}</div>
        </Modal>)}
      {act && <ConfirmDialog title={act.status === 'ACTIVE' ? 'Activate admin?' : 'Deactivate admin?'} message={act.name} danger={act.status === 'INACTIVE'} onConfirm={changeStatus} onClose={() => setAct(null)} />}
    </>
  )
}
