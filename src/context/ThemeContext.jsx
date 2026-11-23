import { createContext, useContext, useEffect, useState } from 'react'

// Light / dark theme. The choice is saved in localStorage and applied as <html data-theme="...">.
const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })

const read = () => { try { return localStorage.getItem('agri_theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' } }

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(read)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('agri_theme', theme) } catch { /* private mode */ }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
