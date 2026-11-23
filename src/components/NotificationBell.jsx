import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../services/authService'
import { ago } from '../utils/format'

/** Bell icon with unread count and a dropdown list. prop "allPath" = page that shows all notifications. */
export default function NotificationBell({ allPath }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const boxRef = useRef(null)
  const navigate = useNavigate()

  const loadCount = () => notificationService.unread().then((r) => setCount(r.count)).catch(() => {})
  const loadList = () => notificationService.list().then((r) => setItems(r.slice(0, 8))).catch(() => {})

  useEffect(() => {                       // refresh the badge every 30 seconds
    loadCount()
    const t = setInterval(loadCount, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {                       // close when clicking outside
    const close = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = () => { if (!open) loadList(); setOpen(!open) }
  const markAll = async () => { await notificationService.readAll(); setCount(0); loadList() }
  const clickItem = async (n) => {
    if (!n.read) { await notificationService.read(n.id); loadCount() }
    setOpen(false)
    navigate(allPath)
  }

  return (
    <div className="rel" ref={boxRef}>
      <button className="icon-btn" onClick={toggle} title="Notifications">🔔{count > 0 && <span className="dot-badge">{count}</span>}</button>
      {open && (
        <div className="dropdown notif-panel">
          <div className="row between" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
            <b>Notifications</b>
            {count > 0 && <button className="btn btn-ghost btn-sm" onClick={markAll}>Mark all read</button>}
          </div>
          {items.length === 0 && <div className="empty" style={{ padding: 28 }}>No notifications yet</div>}
          {items.map((n) => (
            <div key={n.id} className={'notif-item' + (n.read ? '' : ' unread')} onClick={() => clickItem(n)}>
              <div className="t">{n.title}</div>
              <div className="m">{n.message}</div>
              <div className="muted small">{ago(n.createdAt)}</div>
            </div>
          ))}
          <div style={{ padding: 8 }}><button className="btn btn-ghost btn-sm btn-block" onClick={() => { setOpen(false); navigate(allPath) }}>View all</button></div>
        </div>
      )}
    </div>
  )
}
