import { get, post, put } from './api'

export const authService = {
  login: (email, password) => post('/api/auth/login', { email, password }),
  registerFarmer: (data) => post('/api/auth/register/farmer', data),
  registerCustomer: (data) => post('/api/auth/register/customer', data),
  logout: () => post('/api/auth/logout'),
  me: () => get('/api/auth/me'),
  updateProfile: (data) => put('/api/auth/profile', data),
  changePassword: (data) => post('/api/auth/change-password', data),
  forgot: (email) => post('/api/auth/forgot-password', { email }),
  reset: (token, newPassword) => post('/api/auth/reset-password', { token, newPassword }),
}

export const notificationService = {
  list: () => get('/api/notifications'),
  unread: () => get('/api/notifications/unread-count'),
  read: (id) => put('/api/notifications/' + id + '/read'),
  readAll: () => put('/api/notifications/read-all'),
}
