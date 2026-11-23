import { Link } from 'react-router-dom'
import { Logo } from './Navbar'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div>
            <div className="logo" style={{ color: '#fff', marginBottom: 12 }}><span className="mark">🌾</span><span>Agro<b>Link</b></span></div>
            <p style={{ maxWidth: 300, fontSize: '0.9rem' }}>A direct bridge between farmers and buyers. Fresh produce, fair prices, zero middlemen.</p>
          </div>
          <div><h4>Marketplace</h4><Link to="/marketplace">All products</Link><Link to="/marketplace?search=rice">Grains</Link><Link to="/marketplace?search=dal">Pulses</Link></div>
          <div><h4>For farmers</h4><Link to="/register">Sell your produce</Link><Link to="/login">Farmer login</Link></div>
          <div><h4>Account</h4><Link to="/login">Login</Link><Link to="/register">Register</Link><Link to="/forgot-password">Forgot password</Link></div>
        </div>
        <div className="copy">© {new Date().getFullYear()} AgroLink · Farm management &amp; direct farmer marketplace</div>
      </div>
    </footer>
  )
}
