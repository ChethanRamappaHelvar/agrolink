import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'

/** Floating bar that appears once at least one product is selected for comparison. */
export default function CompareBar() {
  const { items, clear } = useCompare()
  if (items.length === 0) return null
  return (
    <div className="cmp-bar">
      <b>⚖️ {items.length} selected</b>
      <span className="muted small">{items.map((i) => i.name).join(' · ')}</span>
      <Link to="/compare" className="btn btn-primary btn-sm">Compare</Link>
      <button className="icon-btn" onClick={clear} title="Clear">✕</button>
    </div>
  )
}
