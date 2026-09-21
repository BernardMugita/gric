import { useQuery } from '@tanstack/react-query'
import { listCountries } from '@/api/countries'
import { listProgrammes } from '@/api/programmes'
import { queryKeys } from '@/api/queryKeys'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/types/enums'

// Temporary landing screen — becomes the real programme/portfolio dashboard
// in a later phase (§8). For now it proves auth + RBAC scope end to end.
export function HomePage() {
  const { user } = useAuth()
  const programmesQuery = useQuery({ queryKey: queryKeys.programmes.all, queryFn: listProgrammes })
  const countriesQuery = useQuery({ queryKey: queryKeys.countries.all, queryFn: listCountries })

  if (!user) return null

  const scopedProgrammeNames =
    user.scopedProgrammeIds.length === 0
      ? ['All programmes']
      : (programmesQuery.data?.data ?? [])
          .filter((programme) => user.scopedProgrammeIds.includes(programme.id))
          .map((programme) => programme.name)

  const scopedCountryNames =
    user.scopedCountryIds.length === 0
      ? ['All countries']
      : (countriesQuery.data?.data ?? [])
          .filter((country) => user.scopedCountryIds.includes(country.id))
          .map((country) => country.name)

  const isLoadingScope = programmesQuery.isLoading || countriesQuery.isLoading

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Welcome, {user.name}</h1>
        <p className="text-sm text-muted-foreground">
          Feature screens (catalog, data entry, dashboards) land in the next build phases.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your access</CardTitle>
          <CardDescription>Role and scope, as returned by /me</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Role</p>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[user.roleId]}
            </Badge>
          </div>

          {isLoadingScope ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Programmes</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {scopedProgrammeNames.map((name) => (
                    <Badge key={name} variant="outline">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Countries</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {scopedCountryNames.map((name) => (
                    <Badge key={name} variant="outline">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Permissions</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="font-mono text-[11px]">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
