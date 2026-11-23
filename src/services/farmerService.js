import { get, post, put, del, patch, request } from './api'

const B = '/api/farmer'
export const farmerService = {
  dashboard: () => get(B + '/dashboard'),
  // farms
  farms: () => get(B + '/farms'),
  createFarm: (d) => post(B + '/farms', d),
  updateFarm: (id, d) => put(B + '/farms/' + id, d),
  deleteFarm: (id) => del(B + '/farms/' + id),
  // crops
  crops: (status) => get(B + '/crops', { status }),
  upcoming: () => get(B + '/crops/upcoming-harvests'),
  cropHistory: () => get(B + '/crops/records'),
  createCrop: (d) => post(B + '/crops', d),
  updateCrop: (id, d) => put(B + '/crops/' + id, d),
  deleteCrop: (id) => del(B + '/crops/' + id),
  addCropRecord: (id, d) => post(B + '/crops/' + id + '/records', d),
  // products
  products: () => get(B + '/products'),
  product: (id) => get(B + '/products/' + id),
  createProduct: (d) => post(B + '/products', d),
  updateProduct: (id, d) => put(B + '/products/' + id, d),
  deleteProduct: (id) => del(B + '/products/' + id),
  setActive: (id, value) => patch(B + '/products/' + id + '/active', { value }),
  uploadImage: (file) => { const f = new FormData(); f.append('file', file); return request(B + '/products/image', { method: 'POST', form: f }) },
  // inventory
  inventory: () => get(B + '/inventory'),
  updateInventory: (id, d) => put(B + '/inventory/' + id, d),
  inventoryHistory: (productId) => get(B + '/inventory/history', { productId }),
  // orders
  orders: (params) => get(B + '/orders', params),
  order: (id) => get(B + '/orders/' + id),
  updateOrderStatus: (id, status, note) => put(B + '/orders/' + id + '/status', { status, note }),
  // expenses + profit
  expenses: () => get(B + '/expenses'),
  expenseSummary: () => get(B + '/expenses/summary'),
  createExpense: (d) => post(B + '/expenses', d),
  updateExpense: (id, d) => put(B + '/expenses/' + id, d),
  deleteExpense: (id) => del(B + '/expenses/' + id),
  // reviews
  reviews: () => get(B + '/reviews'),
  reportReview: (id, reason) => post(B + '/reviews/' + id + '/report', { reason }),
}
