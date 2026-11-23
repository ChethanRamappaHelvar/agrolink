import { useTheme } from '../context/ThemeContext'

/** Sun / moon button that switches between the light and dark theme. */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button className="icon-btn" onClick={toggle} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} aria-label="Toggle theme">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
