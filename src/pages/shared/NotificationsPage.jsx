import { notificationService } from '../../services/authService'
import { useAsync } from '../../hooks/useAsync'
import { ago } from '../../utils/format'
import { Empty, Spinner } from '../../components/ui'

const ICON = { ORDER: '📦', STOCK: '⚠️', HARVEST: '🌾', REVIEW: '⭐', SYSTEM: '🔔', ADMIN: '📣', COMPLAINT: '🛠️' }

export default function NotificationsPage() {
  const { data, loading, reload } = useAsync(() => notificationService.list(), [])
  const markAll = async () => { await notificationService.readAll(); reload() }
  const open = async (n) => { if (!n.read) { await notificationService.read(n.id); reload() } }
  const unread = (data || []).filter((n) => !n.read).length

  return (
    <>
      <div className="page-head"><div><h2>Notifications</h2><p>{unread} unread</p></div>{unread > 0 && <button className="btn btn-outline" onClick={markAll}>Mark all as read</button>}</div>
      <div className="card" style={{ padding: 0 }}>
        {loading ? <Spinner /> : (data || []).length === 0 ? <Empty icon="🔔" title="You're all caught up" text="New alerts about orders, stock and harvests will appear here." /> :
          data.map((n) => (
            <div key={n.id} className={'notif-item' + (n.read ? '' : ' unread')} onClick={() => open(n)} style={{ display: 'flex', gap: 14, padding: '16px 20px' }}>
              <span style={{ fontSize: '1.5rem' }}>{ICON[n.type] || '🔔'}</span>
              <div className="grow"><div className="t">{n.title}</div><div className="m">{n.message}</div></div>
              <span className="muted small">{ago(n.createdAt)}</span>
            </div>
          ))}
      </div>
    </>
  )
}
