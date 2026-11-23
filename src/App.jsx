import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { BuyerProvider } from './context/BuyerContext'

import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Compare from './pages/Compare'
import CompareBar from './components/CompareBar'
import ForgotPassword from './pages/ForgotPassword'
import ProfilePage from './pages/shared/ProfilePage'
import NotificationsPage from './pages/shared/NotificationsPage'

import BuyerLayout from './pages/buyer/BuyerLayout'
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import Cart from './pages/buyer/Cart'
import Wishlist from './pages/buyer/Wishlist'
import Checkout from './pages/buyer/Checkout'
import Orders from './pages/buyer/Orders'
import OrderDetail from './pages/buyer/OrderDetail'
import Addresses from './pages/buyer/Addresses'
import MyReviews from './pages/buyer/MyReviews'
import MyComplaints from './pages/buyer/MyComplaints'

import FarmerLayout from './pages/farmer/FarmerLayout'
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import Farms from './pages/farmer/Farms'
import Crops from './pages/farmer/Crops'
import Products from './pages/farmer/Products'
import ProductForm from './pages/farmer/ProductForm'
import Inventory from './pages/farmer/Inventory'
import FarmerOrders from './pages/farmer/FarmerOrders'
import FarmerOrderDetail from './pages/farmer/FarmerOrderDetail'
import FarmerReviews from './pages/farmer/FarmerReviews'
import Expenses from './pages/farmer/Expenses'

import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import { AdminFarmers, AdminFarmerDetail } from './pages/admin/AdminFarmers'
import { AdminCustomers, AdminCustomerDetail } from './pages/admin/AdminCustomers'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import { AdminOrders, AdminOrderDetail } from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'
import AdminReviews from './pages/admin/AdminReviews'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminReports from './pages/admin/AdminReports'
import AdminAccounts from './pages/admin/AdminAccounts'
import AdminActivity from './pages/admin/AdminActivity'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminBanners from './pages/admin/AdminBanners'
import { adminAuthService } from './services/admin/adminService'

/** Public pages share the navbar + footer. */
function PublicShell() {
  return (
    <BuyerProvider>
      <Navbar />
      <div style={{ minHeight: '70vh' }}><Outlet /></div>
      <Footer />
      <CompareBar />
    </BuyerProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ---------- BUYER ---------- */}
      <Route path="/buyer" element={<ProtectedRoute role="CUSTOMER"><BuyerLayout /></ProtectedRoute>}>
        <Route index element={<BuyerDashboard />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="reviews" element={<MyReviews />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ---------- FARMER ---------- */}
      <Route path="/farmer" element={<ProtectedRoute role="FARMER"><FarmerLayout /></ProtectedRoute>}>
        <Route index element={<FarmerDashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="crops" element={<Crops />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<FarmerOrders />} />
        <Route path="orders/:id" element={<FarmerOrderDetail />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reviews" element={<FarmerReviews />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ---------- ADMIN (separate login + layout, role ADMIN only) ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword admin forgotFn={adminAuthService.forgot} resetFn={adminAuthService.reset} />} />
      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="farmers" element={<AdminFarmers />} />
        <Route path="farmers/:id" element={<AdminFarmerDetail />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<AdminCustomerDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
