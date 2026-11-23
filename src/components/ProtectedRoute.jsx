import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Only lets the given role in. Everybody else is sent to the login page. */
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return children
}
