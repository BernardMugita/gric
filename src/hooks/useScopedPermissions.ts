import { useAuthStore } from '@/stores/authStore'

/**
 * §11 permission model: role defines the *action set* (permissions),
 * programme + country define the *object set* a role can act on. An empty
 * scope array means "all" (e.g. MEL Lead: all programmes × all countries) —
 * this only gates the UI; the server enforces the real boundary.
 */
export function useScopedPermissions() {
  const user = useAuthStore((state) => state.user)

  function hasPermission(permission: string): boolean {
    return user?.permissions.includes(permission) ?? false
  }

  function canActOnProgramme(programmeId: string): boolean {
    if (!user) return false
    return user.scopedProgrammeIds.length === 0 || user.scopedProgrammeIds.includes(programmeId)
  }

  function canActOnCountry(countryId: string): boolean {
    if (!user) return false
    return user.scopedCountryIds.length === 0 || user.scopedCountryIds.includes(countryId)
  }

  return { hasPermission, canActOnProgramme, canActOnCountry }
}
