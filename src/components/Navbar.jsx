import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBuyer } from '../context/BuyerContext'
import { initials } from '../utils/format'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

export const Logo = ({ to = '/' }) => (
  <Link to={to} className="logo"><span className="mark">🌾</span><span>Agro<b>Link</b></span></Link>
)

/** Top navigation used on the public pages and the whole buyer area. */
export default function Navbar() {
  const { user, logout } = useAuth()
  const { counts } = useBuyer()
  const [menu, setMenu] = useState(false)
  const [profile, setProfile] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const isBuyer = user?.role === 'CUSTOMER'

  useEffect(() => {
    const close = (e) => profileRef.current && !profileRef.current.contains(e.target) && setProfile(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const doLogout = async () => { await logout(); navigate('/') }
  const home = user?.role === 'FARMER' ? '/farmer' : isBuyer ? '/buyer' : '/'

  return (
    <header className="navbar">
      <div className="container inner">
        <Logo />
        <nav className={'nav-links' + (menu ? ' open' : '')} onClick={() => setMenu(false)}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/marketplace">Marketplace</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          {isBuyer && <NavLink to="/buyer" end>Dashboard</NavLink>}
          {isBuyer && <NavLink to="/buyer/orders">My Orders</NavLink>}
          {user?.role === 'FARMER' && <NavLink to="/farmer">Farmer Dashboard</NavLink>}
        </nav>
        <div className="nav-right">
          <ThemeToggle />
          {isBuyer && (
            <>
              <Link to="/buyer/wishlist" className="icon-btn" title="Wishlist">❤️{counts.wishlistCount > 0 && <span className="dot-badge">{counts.wishlistCount}</span>}</Link>
              <Link to="/buyer/cart" className="icon-btn" title="Cart">🛒{counts.cartCount > 0 && <span className="dot-badge">{counts.cartCount}</span>}</Link>
              <NotificationBell allPath="/buyer/notifications" />
            </>
          )}
          {user ? (
            <div className="rel" ref={profileRef}>
              <button className="icon-btn" style={{ marginLeft: 6 }} onClick={() => setProfile(!profile)}><span className="avatar">{initials(user.name)}</span></button>
              {profile && (
                <div className="dropdown" onClick={() => setProfile(false)}>
                  <div style={{ padding: '8px 12px' }}><b>{user.name}</b><div className="muted small">{user.userCode} · {user.role}</div></div>
                  <hr />
                  <Link to={home}>Dashboard</Link>
                  <Link to={isBuyer ? '/buyer/profile' : '/farmer/profile'}>My Profile</Link>
                  <hr />
                  <button onClick={doLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join free</Link>
            </>
          )}
          <button className="icon-btn menu-toggle" onClick={() => setMenu(!menu)}>☰</button>
        </div>
      </div>
    </header>
  )
}
