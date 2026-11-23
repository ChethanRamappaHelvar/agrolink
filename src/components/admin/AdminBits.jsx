import { useEffect, useState } from 'react'
import { Pagination, Spinner, ErrorBox } from '../ui'

/**
 * Loads a paged admin list. Usage:
 *   const list = usePagedList((p) => adminService.farmers(p), { search, status })
 * Re-loads whenever the filters or the page change. Typing in "search" is debounced.
 */
export function usePagedList(loader, filters, size = 10) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  const key = JSON.stringify(filters)

  useEffect(() => { setPage(0) }, [key])
  useEffect(() => {
    let live = true
    setError('')
    const t = setTimeout(() => {
      loader({ ...filters, page, size }).then((r) => live && setData(r)).catch((e) => live && setError(e.message))
    }, 250)
    return () => { live = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, page, tick])

  return { data, error, page, setPage, reload: () => setTick((x) => x + 1), loading: !data && !error }
}

/** Standard footer for a paged table: spinner / error / pagination. */
export function ListState({ list, children }) {
  if (list.error) return <ErrorBox message={list.error} />
  if (!list.data) return <Spinner />
  return (
    <>
      {children}
      <Pagination page={list.data.page} totalPages={list.data.totalPages} onChange={list.setPage} />
      <p className="muted small center mt">{list.data.totalItems} record(s)</p>
    </>
  )
}

/** Status select used in many filter bars. options = ['ALL value', ...] */
export const Select = ({ value, onChange, options, all = 'All' }) => (
  <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">{all}</option>
    {options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>))}
  </select>
)

/** Downloads rows as a CSV file (opens in Excel). */
export function downloadCsv(filename, columns, rows) {
  const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const csv = [columns.join(','), ...rows.map((r) => columns.map((c) => esc(r[c])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
