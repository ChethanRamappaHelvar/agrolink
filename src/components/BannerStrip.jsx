import { Link } from 'react-router-dom'
import { publicService } from '../services/publicService'
import { useAsync } from '../hooks/useAsync'

/** Announcement banners created by the admin (shown on the home page). */
export default function BannerStrip() {
  const { data } = useAsync(() => publicService.banners().catch(() => []), [])
  if (!data || data.length === 0) return null
  return (
    <div className="banner-strip">
      {data.map((b) => (
        <div className={'banner ' + (b.style || 'INFO')} key={b.id}>
          <span><b>{b.title}</b> — {b.message}</span>
          {b.link && (b.link.startsWith('http') ? <a href={b.link} target="_blank" rel="noreferrer">Know more →</a> : <Link to={b.link}>Shop now →</Link>)}
        </div>
      ))}
    </div>
  )
}
