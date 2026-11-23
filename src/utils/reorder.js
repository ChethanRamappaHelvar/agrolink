import { buyerService } from '../services/buyerService'

/**
 * "Buy again": puts the items of an old order into the cart using the normal add-to-cart API.
 * Products that are sold out (or no longer sold) are skipped and reported in the message.
 */
export async function reorderItems(items) {
  let added = 0
  const skipped = []
  for (const i of items) {
    try { await buyerService.addToCart(i.productId, i.quantity); added++ } catch { skipped.push(i.name) }
  }
  if (added === 0) return { added, msg: 'None of these items can be added right now' }
  return { added, msg: added + ' item(s) added to your cart' + (skipped.length ? ' (skipped: ' + skipped.join(', ') + ')' : '') }
}
