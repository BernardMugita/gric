import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Real admin screens (users/roles, catalog versioning) land in a later
// phase — this exists to prove RequireScope actually gates the route.
export function AdminPlaceholder() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Admin</CardTitle>
        <CardDescription>User/role management and catalog versioning land here.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        You're seeing this because your role has the "user:manage" permission.
      </CardContent>
    </Card>
  )
}
