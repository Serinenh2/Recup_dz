import { useAuthStore } from '../../store'

export default function PermissionGuard({ permission, roles, children, fallback = null }) {
  const hasPermission = useAuthStore(s => s.hasPermission)
  const hasRole = useAuthStore(s => s.hasRole)

  if (permission && !hasPermission(permission)) return fallback
  if (roles && !hasRole(...roles)) return fallback

  return children
}
