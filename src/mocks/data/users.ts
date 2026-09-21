import type { User } from '@/types/user'

// One demo user per §11 role. The mock login (mocks/handlers/auth.ts)
// accepts any password for these emails — there's no real backend yet.
export const users: User[] = [
  {
    id: 'user_po_eccde_ke',
    name: 'Amara Otieno',
    email: 'amara.otieno@gric.org',
    roleId: 'programme_officer',
    scopedProgrammeIds: ['prog_eccde'],
    scopedCountryIds: ['country_ke'],
  },
  {
    id: 'user_policy_lead',
    name: 'Daniel Mwangi',
    email: 'daniel.mwangi@gric.org',
    roleId: 'policy_partnerships_lead',
    scopedProgrammeIds: ['prog_policy_partnership'],
    scopedCountryIds: ['country_ke', 'country_ug', 'country_tz'],
  },
  {
    id: 'user_km_lead',
    name: 'Grace Nabirye',
    email: 'grace.nabirye@gric.org',
    roleId: 'km_communications_lead',
    scopedProgrammeIds: ['prog_institutional_strengthening'],
    scopedCountryIds: ['country_ke', 'country_ug', 'country_tz'],
  },
  {
    id: 'user_mel_systems_lead',
    name: 'Peter Kamau',
    email: 'peter.kamau@gric.org',
    roleId: 'mel_systems_lead',
    scopedProgrammeIds: [],
    scopedCountryIds: [],
  },
  {
    id: 'user_gender_focal_point',
    name: 'Fatuma Ali',
    email: 'fatuma.ali@gric.org',
    roleId: 'gender_focal_point',
    scopedProgrammeIds: [],
    scopedCountryIds: [],
  },
  {
    id: 'user_country_coordinator_ke',
    name: 'James Kiptoo',
    email: 'james.kiptoo@gric.org',
    roleId: 'country_coordinator',
    scopedProgrammeIds: [],
    scopedCountryIds: ['country_ke'],
  },
  {
    id: 'user_mel_lead',
    name: 'Sarah Nakato',
    email: 'sarah.nakato@gric.org',
    roleId: 'mel_lead',
    scopedProgrammeIds: [],
    scopedCountryIds: [],
  },
  {
    id: 'user_africa_leadership',
    name: 'Joseph Mbeki',
    email: 'joseph.mbeki@gric.org',
    roleId: 'gric_africa_leadership',
    scopedProgrammeIds: [],
    scopedCountryIds: [],
  },
  {
    id: 'user_system_admin',
    name: 'System Administrator',
    email: 'admin@gric.org',
    roleId: 'system_admin',
    scopedProgrammeIds: [],
    scopedCountryIds: [],
  },
]
