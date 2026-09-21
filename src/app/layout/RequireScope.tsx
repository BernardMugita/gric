import { Outlet } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useScopedPermissions } from '@/hooks/useScopedPermissions'

interface RequireScopeProps {
  permission: string
}

/** Route-level RBAC gate — hides/blocks UI only; the API enforces the real boundary (§11). */
export function RequireScope({ permission }: RequireScopeProps) {
  const { hasPermission } = useScopedPermissions()

  if (!hasPermission(permission)) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Not authorized</AlertTitle>
          <AlertDescription>
            Your role doesn't include the "{permission}" permission required for this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <Outlet />
}
