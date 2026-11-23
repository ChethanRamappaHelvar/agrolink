import { get, post, put, del, patch } from '../api'

const B = '/api/admin'

export const adminAuthService = {
  login: (email, password) => post(B + '/auth/login', { email, password }),
  forgot: (email) => post(B + '/auth/forgot-password', { email }),
  reset: (token, newPassword) => post(B + '/auth/reset-password', { token, newPassword }),
}

export const adminService = {
  dashboard: () => get(B + '/dashboard'),
  search: (q) => get(B + '/search', { q }),
  // farmers
  farmers: (p) => get(B + '/farmers', p),
  farmer: (id) => get(B + '/farmers/' + id),
  verifyFarmer: (id, decision, remark) => put(B + '/farmers/' + id + '/verification', { decision, remark }),
  farmerStatus: (userId, status) => put(B + '/farmers/' + userId + '/status', { status }),
  // customers
  customers: (p) => get(B + '/customers', p),
  customer: (id) => get(B + '/customers/' + id),
  customerStatus: (userId, status) => put(B + '/customers/' + userId + '/status', { status }),
  // products
  products: (p) => get(B + '/products', p),
  product: (id) => get(B + '/products/' + id),
  decide: (id, decision, remark) => put(B + '/products/' + id + '/decision', { decision, remark }),
  editProduct: (id, d) => put(B + '/products/' + id, d),
  removeProduct: (id, reason) => del(B + '/products/' + id + (reason ? '?reason=' + encodeURIComponent(reason) : '')),
  // categories
  categories: () => get(B + '/categories'),
  categoryProducts: (id) => get(B + '/categories/' + id + '/products'),
  createCategory: (d) => post(B + '/categories', d),
  updateCategory: (id, d) => put(B + '/categories/' + id, d),
  categoryActive: (id, value) => patch(B + '/categories/' + id + '/active', { value }),
  deleteCategory: (id) => del(B + '/categories/' + id),
  // coupons
  coupons: () => get(B + '/coupons'),
  createCoupon: (d) => post(B + '/coupons', d),
  updateCoupon: (id, d) => put(B + '/coupons/' + id, d),
  couponActive: (id, value) => patch(B + '/coupons/' + id + '/active', { value }),
  deleteCoupon: (id) => del(B + '/coupons/' + id),
  // banners
  banners: () => get(B + '/banners'),
  createBanner: (d) => post(B + '/banners', d),
  updateBanner: (id, d) => put(B + '/banners/' + id, d),
  bannerActive: (id, value) => patch(B + '/banners/' + id + '/active', { value }),
  deleteBanner: (id) => del(B + '/banners/' + id),
  // orders + payments
  orders: (p) => get(B + '/orders', p),
  order: (id) => get(B + '/orders/' + id),
  orderNote: (id, note) => post(B + '/orders/' + id + '/notes', { note }),
  payments: (p) => get(B + '/payments', p),
  // reviews
  reviews: (p) => get(B + '/reviews', p),
  productRatings: () => get(B + '/reviews/product-ratings'),
  removeReview: (id, reason) => del(B + '/reviews/' + id + (reason ? '?reason=' + encodeURIComponent(reason) : '')),
  dismissReport: (id) => put(B + '/reviews/' + id + '/dismiss-report'),
  // complaints
  complaints: (p) => get(B + '/complaints', p),
  complaint: (id) => get(B + '/complaints/' + id),
  updateComplaint: (id, d) => put(B + '/complaints/' + id, d),
  // notifications
  sendNotification: (d) => post(B + '/notifications', d),
  sentNotifications: () => get(B + '/notifications/history'),
  // reports
  report: (type, p) => get(B + '/reports/' + type, p),
  // accounts + logs
  admins: () => get(B + '/accounts'),
  permissions: () => get(B + '/accounts/permissions'),
  createAdmin: (d) => post(B + '/accounts', d),
  adminStatus: (id, status) => put(B + '/accounts/' + id + '/status', { status }),
  setPermissions: (id, permissions) => put(B + '/accounts/' + id + '/permissions', { permissions }),
  activity: (p) => get(B + '/activity-logs', p),
}
