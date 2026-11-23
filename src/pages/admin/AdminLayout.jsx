import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import GlobalSearch from '../../components/admin/GlobalSearch'
import { adminService } from '../../services/admin/adminService'

const sections = [
  { title: 'Overview', links: [{ to: '/admin', icon: '📊', text: 'Dashboard', end: true }] },
  { title: 'People', links: [
    { to: '/admin/farmers', icon: '👨‍🌾', text: 'Farmers' },
    { to: '/admin/customers', icon: '🛍️', text: 'Customers' }] },
  { title: 'Marketplace', links: [
    { to: '/admin/products', icon: '🥕', text: 'Products' },
    { to: '/admin/categories', icon: '🗂️', text: 'Categories' },
    { to: '/admin/orders', icon: '🧾', text: 'Orders' },
    { to: '/admin/payments', icon: '💳', text: 'Payments' },
    { to: '/admin/reviews', icon: '⭐', text: 'Reviews' },
    { to: '/admin/coupons', icon: '🎟️', text: 'Coupons' },
    { to: '/admin/banners', icon: '📢', text: 'Home banners' },
    { to: '/admin/complaints', icon: '🛠️', text: 'Complaints' }] },
  { title: 'Insights', links: [
    { to: '/admin/reports', icon: '📈', text: 'Reports' },
    { to: '/admin/notifications', icon: '📣', text: 'Send notifications' }] },
  { title: 'Administration', links: [
    { to: '/admin/accounts', icon: '🔐', text: 'Admin accounts' },
    { to: '/admin/activity', icon: '🕘', text: 'Activity log' },
    { to: '/admin/profile', icon: '👤', text: 'My profile' }] },
]

export default function AdminLayout() {
  const [badge, setBadge] = useState({})
  useEffect(() => {
    adminService.dashboard().then((d) => setBadge({ '/admin/products': d.pendingProducts, '/admin/complaints': d.openComplaints, '/admin/farmers': d.pendingFarmers })).catch(() => {})
  }, [])
  return <DashboardLayout admin sections={sections} badge={badge} profilePath="/admin/profile" loginPath="/admin/login" search={<GlobalSearch />} />
}
