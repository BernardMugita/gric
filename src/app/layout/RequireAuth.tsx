import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function RequireAuth() {
  const status = useAuthStore((state) => state.status)
  const hydrate = useAuthStore((state) => state.hydrate)
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') void hydrate()
  }, [status, hydrate])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
