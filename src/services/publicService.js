import { get } from './api'

// Marketplace data that needs no login
export const publicService = {
  categories: () => get('/api/public/categories'),
  locations: () => get('/api/public/locations'),
  stats: () => get('/api/public/stats'),
  products: (params) => get('/api/public/products', params),
  product: (id) => get('/api/public/products/' + id),
  reviews: (id) => get('/api/public/products/' + id + '/reviews'),
  banners: () => get('/api/public/banners'),
  recommendations: (id) => get('/api/public/products/' + id + '/recommendations'),
}
