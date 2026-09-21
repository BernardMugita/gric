// Enumerations from FRD §3. Modeled as literal-string unions backed by
// `as const` arrays (not TS `enum`, which is disallowed under
// erasableSyntaxOnly) so the same list drives both the type and any
// runtime iteration (filter dropdowns, generators, etc).

export const RESULT_LEVELS = ['Activity', 'Output', 'Outcome', 'Goal'] as const
export type ResultLevel = (typeof RESULT_LEVELS)[number]

export const FREQUENCY_LABELS = [
  'Weekly',
  'Termly',
  'Quarterly',
  'Bi-annually',
  'Annually',
  'Per cycle',
  'Milestone-based',
] as const
export type FrequencyLabel = (typeof FREQUENCY_LABELS)[number]

export const SPHERES_OF_ACCOUNTABILITY = [
  'Direct Delivery',
  'Coaching / Influence',
  'Advocacy / Strategic Interest',
] as const
export type SphereOfAccountability = (typeof SPHERES_OF_ACCOUNTABILITY)[number]

export const GENDER_INTEGRATION_LEVELS = [
  'Unintentional',
  'Responsive',
  'Intentional',
  'Transformative',
] as const
export type GenderIntegrationLevel = (typeof GENDER_INTEGRATION_LEVELS)[number]

export const INDICATOR_STATUSES = ['Pending', 'Ready', 'Aspirational'] as const
export type IndicatorStatus = (typeof INDICATOR_STATUSES)[number]

export const DISAGGREGATION_DIMENSION_NAMES = [
  'Sex',
  'Age band',
  'Country',
  'Stakeholder type',
] as const
export type DisaggregationDimensionName = (typeof DISAGGREGATION_DIMENSION_NAMES)[number]

export const DATA_POINT_STATUSES = ['draft', 'submitted', 'approved', 'rejected'] as const
export type DataPointStatus = (typeof DATA_POINT_STATUSES)[number]

export const VALUE_TYPES = ['numeric', 'percentage', 'narrative', 'notYetTracked'] as const
export type ValueType = (typeof VALUE_TYPES)[number]

export const IMPORT_TYPES = ['frameworkMigration', 'bulkData'] as const
export type ImportType = (typeof IMPORT_TYPES)[number]

export const IMPORT_STATUSES = [
  'queued',
  'validating',
  'importing',
  'completed',
  'failed',
] as const
export type ImportStatus = (typeof IMPORT_STATUSES)[number]

// §11 roles, taken from the workbook's "Responsible" column.
export const ROLE_IDS = [
  'programme_officer',
  'policy_partnerships_lead',
  'km_communications_lead',
  'mel_systems_lead',
  'gender_focal_point',
  'country_coordinator',
  'mel_lead',
  'gric_africa_leadership',
  'system_admin',
] as const
export type RoleId = (typeof ROLE_IDS)[number]

export const ROLE_LABELS: Record<RoleId, string> = {
  programme_officer: 'Programme Officer',
  policy_partnerships_lead: 'Policy & Partnerships Lead',
  km_communications_lead: 'Knowledge Management & Communications Lead',
  mel_systems_lead: 'MEL Systems Lead',
  gender_focal_point: 'Gender Focal Point',
  country_coordinator: 'Country Coordinator',
  mel_lead: 'MEL Lead',
  gric_africa_leadership: 'GRiC Africa Leadership',
  system_admin: 'System Admin',
}
