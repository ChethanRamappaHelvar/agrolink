import { useState } from 'react'
import { getRecent, clearRecent } from '../utils/recent'
import { useShopActions } from '../hooks/useShopActions'
import ProductCard from './ProductCard'

/** Row of products the visitor opened recently (read from localStorage). */
export default function RecentlyViewed({ skipId, inline }) {
  const [list, setList] = useState(() => getRecent().filter((p) => p.id !== skipId))
  const { addToCart, toggleWish, wishIds } = useShopActions()
  if (list.length === 0) return null
  const body = (
    <>
      <div className="section-head">
        <div><div className="eyebrow">Pick up where you left</div><h2>Recently viewed</h2></div>
        <button className="btn btn-ghost btn-sm" onClick={() => { clearRecent(); setList([]) }}>Clear</button>
      </div>
      <div className="recent-row">
        {list.map((p) => <ProductCard key={p.id} product={p} wished={wishIds.has(p.id)} onWish={toggleWish} onAdd={addToCart} />)}
      </div>
    </>
  )
  return inline ? <div className="mt2">{body}</div> : <section className="section" style={{ paddingTop: 10 }}><div className="container">{body}</div></section>
}
