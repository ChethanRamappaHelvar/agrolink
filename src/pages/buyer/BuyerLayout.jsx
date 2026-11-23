import { NavLink, Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { BuyerProvider } from '../../context/BuyerContext'

const tabs = [
  ['/buyer', '📊 Dashboard', true], ['/buyer/orders', '📦 Orders'], ['/buyer/wishlist', '❤️ Wishlist'], ['/buyer/cart', '🛒 Cart'],
  ['/buyer/addresses', '📍 Addresses'], ['/buyer/reviews', '⭐ Reviews'], ['/buyer/complaints', '🛠️ Complaints'],
  ['/buyer/notifications', '🔔 Alerts'], ['/buyer/profile', '👤 Profile'],
]

/** Wraps every page of the buyer area: navbar + a tab strip + footer. */
export default function BuyerLayout() {
  return (
    <BuyerProvider>
      <Navbar />
      <div className="container" style={{ paddingTop: 22, minHeight: '70vh' }}>
        <div className="row gap-sm mb" style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 6 }}>
          {tabs.map(([to, text, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => 'chip' + (isActive ? ' on' : '')} style={{ whiteSpace: 'nowrap' }}>{text}</NavLink>
          ))}
        </div>
        <Outlet />
      </div>
      <Footer />
    </BuyerProvider>
  )
}
