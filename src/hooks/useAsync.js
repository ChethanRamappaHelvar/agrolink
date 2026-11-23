import { useState, useEffect, useCallback } from 'react'

/**
 * Loads data when the page opens (useEffect) and gives { data, loading, error, reload }.
 *   const { data, loading, error, reload } = useAsync(() => farmerService.farms(), [])
 */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setData(await fn()) } catch (e) { setError(e.message) } finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load, setData }
}
