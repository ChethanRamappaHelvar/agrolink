import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authService'
import { storage } from '../services/api'
import { adminAuthService } from '../services/admin/adminService'

// Context API: any component can read the logged-in user with useAuth(),
// so we do not need to pass "user" down through props on every level.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser())   // restored from localStorage after refresh

  const login = useCallback(async (email, password, admin = false) => {
    const data = admin ? await adminAuthService.login(email, password) : await authService.login(email, password)
    storage.save(data.token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* token may already be invalid */ }
    storage.clear()
    setUser(null)
  }, [])

  /** Re-reads the profile from the server (after profile edits). */
  const refresh = useCallback(async () => {
    const u = await authService.me()
    storage.saveUser(u)
    setUser(u)
    return u
  }, [])

  return <AuthContext.Provider value={{ user, login, logout, refresh, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
