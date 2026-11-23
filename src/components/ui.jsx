import { useState } from 'react'
import { imageSrc } from '../services/api'
import { label } from '../utils/format'

/** Colour of a status badge */
const COLORS = {
  PLACED: 'b-blue', ACCEPTED: 'b-purple', PROCESSING: 'b-amber', SHIPPED: 'b-blue', DELIVERED: 'b-green', CANCELLED: 'b-red',
  PENDING: 'b-amber', APPROVED: 'b-green', REJECTED: 'b-red', INACTIVE: 'b-gray', ACTIVE: 'b-green', VERIFIED: 'b-green',
  COMPLETED: 'b-green', FAILED: 'b-red', REFUNDED: 'b-purple',
  PLANNED: 'b-blue', GROWING: 'b-green', HARVESTED: 'b-gray',
  OPEN: 'b-red', UNDER_REVIEW: 'b-amber', RESOLVED: 'b-green',
  OK: 'b-green', LOW: 'b-amber', OUT: 'b-red',
}
export const Badge = ({ status, text }) => <span className={'badge ' + (COLORS[status] || 'b-gray')}>{text || label(status)}</span>

export const Spinner = () => <div className="spinner" />

export const Empty = ({ icon = '🌱', title, text, children }) => (
  <div className="empty">
    <span className="big">{icon}</span>
    <h3>{title}</h3>
    {text && <p style={{ marginTop: 6 }}>{text}</p>}
    {children && <div className="mt">{children}</div>}
  </div>
)

export const ErrorBox = ({ message }) => (message ? <div className="alert alert-error">⚠️ {message}</div> : null)

/** Card for numbers on dashboards. props: icon, value, label, tone */
export const Stat = ({ icon, value, text, tone = 'green' }) => (
  <div className="stat">
    <div className={'ico ico-' + tone}>{icon}</div>
    <div><b>{value}</b><span>{text}</span></div>
  </div>
)

export const Stars = ({ value = 0 }) => {
  const full = Math.round(value)
  return <span className="stars">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= full ? '' : 'off'}>★</span>)}</span>
}

export function RatingInput({ value, onChange }) {
  return (
    <div className="rating-input">
      {[1, 2, 3, 4, 5].map((i) => <button type="button" key={i} className={i <= value ? 'on' : ''} onClick={() => onChange(i)}>★</button>)}
    </div>
  )
}

/** A form row: label + any input (children) + optional error text */
export const Field = ({ label: text, hint, children, full }) => (
  <div className={'field' + (full ? ' full' : '')}>
    {text && <label>{text}</label>}
    {children}
    {hint && <span className="hint">{hint}</span>}
  </div>
)

export function Modal({ title, onClose, children, footer, size = '' }) {
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal ' + size}>
        <div className="modal-head"><h3 style={{ margin: 0 }}>{title}</h3><button className="icon-btn" onClick={onClose}>✕</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

/** Confirmation before important actions. Optional text box for a reason. */
export function ConfirmDialog({ title, message, confirmText = 'Confirm', danger, askReason, reasonLabel = 'Reason', onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const go = async () => {
    setBusy(true)
    try { await onConfirm(reason) } finally { setBusy(false) }
  }
  return (
    <Modal title={title} size="sm" onClose={onClose} footer={
      <>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className={'btn ' + (danger ? 'btn-danger' : 'btn-primary')} disabled={busy || (askReason && !reason.trim())} onClick={go}>{busy ? 'Please wait...' : confirmText}</button>
      </>}>
      <p className="soft">{message}</p>
      {askReason && (
        <div className="field mt">
          <label>{reasonLabel}</label>
          <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Type here..." />
        </div>
      )}
    </Modal>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  const pages = []
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map((p, i) => p === '…' ? <span key={i} className="muted">…</span> :
        <button key={i} className={p === page ? 'on' : ''} onClick={() => onChange(p)}>{p + 1}</button>)}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>›</button>
    </div>
  )
}

/** Product picture or the category emoji when there is no photo */
export const Thumb = ({ url, icon }) => (
  <div className="thumb">{url ? <img src={imageSrc(url)} alt="" /> : icon || '🌿'}</div>
)

/** Simple vertical bar chart (pure CSS). data = [{label, value, text}] */
export function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="bars">
      {data.map((d) => (
        <div className="bar-col" key={d.label}>
          <em>{d.text}</em>
          <div className="bar" style={{ height: (d.value / max) * 100 + '%' }} title={d.text} />
          <small>{d.label}</small>
        </div>
      ))}
    </div>
  )
}

/** Horizontal bars. data = [{label, value, color}] */
export function HBars({ data, format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div>
      {data.map((d) => (
        <div className="hbar" key={d.label}>
          <div className="lab"><span>{d.label}</span><b>{format(d.value)}</b></div>
          <div className="track2"><div className="fill" style={{ width: (d.value / max) * 100 + '%', background: d.color || 'var(--accent)' }} /></div>
        </div>
      ))}
    </div>
  )
}

/** SVG donut chart. data = [{label, value, color}] */
export function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const R = 52, C = 2 * Math.PI * R
  return (
    <div className="donut-wrap">
      <svg width="150" height="150" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="22" />
        {total > 0 && data.map((d) => {
          const len = (d.value / total) * C
          const el = <circle key={d.label} cx="70" cy="70" r={R} fill="none" stroke={d.color} strokeWidth="22"
            strokeDasharray={len + ' ' + (C - len)} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />
          acc += len
          return el
        })}
        <text x="70" y="68" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--heading)" fontFamily="Poppins, sans-serif">{total}</text>
        <text x="70" y="86" textAnchor="middle" fontSize="10" fill="var(--muted)">TOTAL</text>
      </svg>
      <div className="legend">{data.map((d) => <div key={d.label}><i style={{ background: d.color }} />{d.label}: <b>{d.value}</b></div>)}</div>
    </div>
  )
}
