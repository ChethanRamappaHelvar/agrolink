import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { farmerService } from '../../services/farmerService'

const sections = [
  { title: 'Overview', links: [{ to: '/farmer', icon: '📊', text: 'Dashboard', end: true }] },
  { title: 'My farm', links: [
    { to: '/farmer/farms', icon: '🏡', text: 'Farms' },
    { to: '/farmer/crops', icon: '🌱', text: 'Crops' }] },
  { title: 'Selling', links: [
    { to: '/farmer/products', icon: '🥕', text: 'Products' },
    { to: '/farmer/inventory', icon: '📦', text: 'Inventory' },
    { to: '/farmer/orders', icon: '🧾', text: 'Orders' },
    { to: '/farmer/reviews', icon: '⭐', text: 'Reviews' }] },
  { title: 'Money', links: [{ to: '/farmer/expenses', icon: '💸', text: 'Expenses & profit' }] },
  { title: 'Account', links: [
    { to: '/farmer/notifications', icon: '🔔', text: 'Notifications' },
    { to: '/farmer/profile', icon: '👤', text: 'Profile' }] },
]

export default function FarmerLayout() {
  const [newOrders, setNewOrders] = useState(0)
  useEffect(() => { farmerService.dashboard().then((d) => setNewOrders(d.newOrders)).catch(() => {}) }, [])
  return <DashboardLayout sections={sections} notifPath="/farmer/notifications" profilePath="/farmer/profile" badge={{ '/farmer/orders': newOrders }} />
}
