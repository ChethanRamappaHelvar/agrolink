import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from './Navbar'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'
import { initials } from '../utils/format'

/**
 * Sidebar + top bar shell used by the farmer area and the admin area.
 * props: links = [{ to, icon, text, end }], title (small text), admin (dark theme), notifPath, profilePath
 */
export default function DashboardLayout({ links, sections, admin, notifPath, profilePath, loginPath = '/login', badge, search }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const current = (sections ? sections.flatMap((s) => s.links) : links).find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))
  const doLogout = async () => { await logout(); navigate(loginPath) }

  const renderLink = (l) => (
    <NavLink key={l.to} to={l.to} end={l.end} className="side-link" onClick={() => setOpen(false)}>
      <span className="ic">{l.icon}</span>{l.text}
      {badge && badge[l.to] > 0 && <span className="count">{badge[l.to]}</span>}
    </NavLink>
  )

  return (
    <div className="dash">
      <div className={'scrim' + (open ? ' open' : '')} onClick={() => setOpen(false)} />
      <aside className={'sidebar' + (admin ? ' admin' : '') + (open ? ' open' : '')}>
        <Logo to={admin ? '/admin' : '/farmer'} />
        {sections
          ? sections.map((s) => <div key={s.title}><div className="side-label">{s.title}</div>{s.links.map(renderLink)}</div>)
          : links.map(renderLink)}
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <NavLink to="/" className="side-link"><span className="ic">🏠</span>View website</NavLink>
          <button className="side-link" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }} onClick={doLogout}><span className="ic">🚪</span>Logout</button>
        </div>
      </aside>
      <div className="dash-main">
        <div className="topbar">
          <button className="icon-btn side-toggle" onClick={() => setOpen(true)}>☰</button>
          <h2>{current?.text || 'Dashboard'}</h2>
          {search}
          <div className="grow" />
          <ThemeToggle />
          {notifPath && <NotificationBell allPath={notifPath} />}
          <NavLink to={profilePath} className="row gap-sm" style={{ marginLeft: 6 }}>
            <span className="avatar">{initials(user?.name)}</span>
            <span className="small bold" style={{ display: 'none' }}>{user?.name}</span>
          </NavLink>
        </div>
        <main className="page"><Outlet /></main>
      </div>
    </div>
  )
}
