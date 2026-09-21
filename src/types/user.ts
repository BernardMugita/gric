import type { RoleId } from './enums'

export interface User {
  id: string
  name: string
  email: string
  roleId: RoleId
  scopedProgrammeIds: string[]
  scopedCountryIds: string[]
}

/** The `/me` shape — a User plus the derived action set for its role (§11). */
export interface Me extends User {
  permissions: string[]
}
