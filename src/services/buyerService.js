import { get, post, put, del } from './api'

const B = '/api/buyer'
export const buyerService = {
  dashboard: () => get(B + '/dashboard'),
  counts: () => get(B + '/counts'),
  // cart
  cart: () => get(B + '/cart'),
  addToCart: (productId, quantity) => post(B + '/cart/items', { productId, quantity }),
  updateCartItem: (id, quantity) => put(B + '/cart/items/' + id, { quantity }),
  removeCartItem: (id) => del(B + '/cart/items/' + id),
  // wishlist
  wishlist: () => get(B + '/wishlist'),
  addWish: (productId) => post(B + '/wishlist/' + productId),
  removeWish: (productId) => del(B + '/wishlist/' + productId),
  moveToCart: (productId) => post(B + '/wishlist/' + productId + '/move-to-cart'),
  // addresses
  addresses: () => get(B + '/addresses'),
  createAddress: (d) => post(B + '/addresses', d),
  updateAddress: (id, d) => put(B + '/addresses/' + id, d),
  deleteAddress: (id) => del(B + '/addresses/' + id),
  // orders
  checkout: (d) => post(B + '/orders/checkout', d),
  orders: (params) => get(B + '/orders', params),
  order: (id) => get(B + '/orders/' + id),
  cancelOrder: (id, reason) => post(B + '/orders/' + id + '/cancel', { reason }),
  invoice: (id) => get(B + '/orders/' + id + '/invoice'),
  // coupons
  coupons: () => get(B + '/coupons'),
  checkCoupon: (code) => post(B + '/coupons/check', { code }),
  // reviews + complaints
  myReviews: () => get(B + '/reviews'),
  createReview: (d) => post(B + '/reviews', d),
  updateReview: (id, d) => put(B + '/reviews/' + id, d),
  deleteReview: (id) => del(B + '/reviews/' + id),
  complaints: () => get(B + '/complaints'),
  createComplaint: (d) => post(B + '/complaints', d),
}
