import type { AuditLogEntry } from '@/types/auditLog'
import type { DataPoint } from '@/types/datapoint'
import type { Domain } from '@/types/domain'
import type { RoleId } from '@/types/enums'
import type { ImportBatch, ImportRowError } from '@/types/importBatch'
import type { Indicator } from '@/types/indicator'
import type { Programme } from '@/types/programme'
import type {
  CompletenessReport,
  DashboardReport,
  GenderIntegrationReport,
  ResultLevelRollup,
} from '@/types/reports'
import type { Me, User } from '@/types/user'
import { GENDER_INTEGRATION_LEVELS, INDICATOR_STATUSES, RESULT_LEVELS } from '@/types/enums'
import { domains as seedDomains, programmes as seedProgrammes } from './data/programmes'
import { indicators as seedIndicators } from './data/indicators'
import { users as seedUsers } from './data/users'
import { mulberry32, pick } from './data/rng'

function clone<T>(value: T): T {
  return structuredClone(value)
}

const ROLE_PERMISSIONS: Record<RoleId, string[]> = {
  programme_officer: ['datapoint:enter', 'datapoint:submit', 'dashboard:view_own_programme'],
  policy_partnerships_lead: ['datapoint:enter', 'datapoint:submit', 'dashboard:view_own_programme'],
  km_communications_lead: ['datapoint:enter', 'datapoint:submit', 'dashboard:view_own_programme'],
  mel_systems_lead: ['catalog:manage_versions', 'import:configure', 'dashboard:view_system_health'],
  gender_focal_point: ['gender:edit', 'report:view_gender'],
  country_coordinator: ['datapoint:approve', 'datapoint:reject', 'dashboard:view_country'],
  mel_lead: [
    'datapoint:approve',
    'datapoint:reject',
    'catalog:manage',
    'import:run',
    'import:approve',
    'report:view_all',
    'baseline:establish',
    'baseline:revise',
  ],
  gric_africa_leadership: [
    'dashboard:view_portfolio',
    'dashboard:view_institutional',
    'indicator:edit_institutional',
  ],
  system_admin: ['user:manage', 'scope:manage', 'auditlog:view'],
}

interface DbState {
  programmes: Programme[]
  domains: Domain[]
  indicators: Indicator[]
  dataPoints: DataPoint[]
  importBatches: ImportBatch[]
  users: User[]
  auditLog: AuditLogEntry[]
  sessions: Map<string, string>
}

let idCounter = 0
let state: DbState = createInitialState()

function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${idCounter.toString(36)}`
}

function createInitialState(): DbState {
  const state: DbState = {
    programmes: clone(seedProgrammes),
    domains: clone(seedDomains),
    indicators: clone(seedIndicators),
    dataPoints: [],
    importBatches: [],
    users: clone(seedUsers),
    auditLog: [],
    sessions: new Map(),
  }
  state.dataPoints = seedDataPoints(state.indicators)
  return state
}

/** A few real data points per hand-authored indicator, for trend/dashboard demos. */
function seedDataPoints(indicators: Indicator[]): DataPoint[] {
  const rng = mulberry32(7)
  const periods = ['2025-Q3', '2025-Q4', '2026-Q1']
  const statuses = ['approved', 'approved', 'submitted', 'draft'] as const
  const points: DataPoint[] = []

  for (const indicator of indicators) {
    if (indicator.id.startsWith('ind_gen')) continue // keep filler indicators data-free for now

    const valueType = indicator.baseline.valueType === 'notYetTracked' || indicator.baseline.valueType === 'narrative'
      ? (indicator.targets[0]?.valueType ?? 'numeric')
      : indicator.baseline.valueType
    const base = indicator.baseline.numericValue ?? 20

    periods.forEach((period, index) => {
      const slice: DataPoint['disaggregationSlice'] = {}
      if (indicator.disaggregationDims.includes('dim_country')) slice.dim_country = 'KE'
      if (indicator.disaggregationDims.includes('dim_sex')) slice.dim_sex = pick(rng, ['Male', 'Female'])

      points.push({
        id: nextId('dp'),
        indicatorId: indicator.id,
        period,
        countryId: 'country_ke',
        disaggregationSlice: slice,
        value:
          valueType === 'narrative'
            ? { valueType: 'narrative', narrativeText: 'Reported qualitatively this period' }
            : { valueType, numericValue: Math.max(0, Math.round(base * (0.8 + index * 0.1 + rng() * 0.1))) },
        status: statuses[index] ?? 'draft',
        submittedBy: 'user_po_eccde_ke',
        submittedAt: `${period.slice(0, 4)}-01-15T00:00:00Z`,
        approvedBy: index < 2 ? 'user_mel_lead' : undefined,
        approvedAt: index < 2 ? `${period.slice(0, 4)}-01-20T00:00:00Z` : undefined,
        evidenceIds: [],
      })
    })
  }

  return points
}

export function resetDb() {
  state = createInitialState()
}

// --- Programmes & domains ---

export function listProgrammes(): Programme[] {
  return state.programmes
}

export function listDomains(programmeId: string): Domain[] {
  return state.domains.filter((domain) => domain.programmeId === programmeId)
}

// --- Indicators ---

export interface IndicatorFilters {
  programmeId?: string
  domainId?: string
  resultLevel?: string
  status?: string
  sphereOfAccountability?: string
  genderIntegrationLevel?: string
  responsibleRoleId?: string
  page?: number
  pageSize?: number
}

export function listIndicators(filters: IndicatorFilters) {
  let items = state.indicators
  if (filters.programmeId) items = items.filter((i) => i.programmeId === filters.programmeId)
  if (filters.domainId) items = items.filter((i) => i.domainId === filters.domainId)
  if (filters.resultLevel) items = items.filter((i) => i.resultLevel === filters.resultLevel)
  if (filters.status) items = items.filter((i) => i.status === filters.status)
  if (filters.sphereOfAccountability)
    items = items.filter((i) => i.sphereOfAccountability === filters.sphereOfAccountability)
  if (filters.genderIntegrationLevel)
    items = items.filter((i) => i.genderIntegrationLevel === filters.genderIntegrationLevel)
  if (filters.responsibleRoleId)
    items = items.filter((i) => i.responsibleRoleId === filters.responsibleRoleId)

  const total = items.length
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 25
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return { items: pageItems, total, page, pageSize, hasMore: start + pageSize < total }
}

export function getIndicator(id: string): Indicator | undefined {
  return state.indicators.find((i) => i.id === id)
}

export function listIndicatorDataPoints(indicatorId: string): DataPoint[] {
  return state.dataPoints.filter((dp) => dp.indicatorId === indicatorId)
}

// --- Data points ---

export interface DataPointFilters {
  indicatorId?: string
  status?: string
  countryId?: string
  page?: number
  pageSize?: number
}

export function listDataPoints(filters: DataPointFilters) {
  let items = state.dataPoints
  if (filters.indicatorId) items = items.filter((dp) => dp.indicatorId === filters.indicatorId)
  if (filters.status) items = items.filter((dp) => dp.status === filters.status)
  if (filters.countryId) items = items.filter((dp) => dp.countryId === filters.countryId)

  const total = items.length
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 25
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return { items: pageItems, total, page, pageSize, hasMore: start + pageSize < total }
}

export function findDataPointByIdempotencyKey(key: string): DataPoint | undefined {
  return state.dataPoints.find((dp) => dp.idempotencyKey === key)
}

export function findDuplicateDataPoint(
  indicatorId: string,
  period: string,
  countryId: string,
  disaggregationSlice: DataPoint['disaggregationSlice'],
): DataPoint | undefined {
  const sliceKey = JSON.stringify(disaggregationSlice ?? {})
  return state.dataPoints.find(
    (dp) =>
      dp.indicatorId === indicatorId &&
      dp.period === period &&
      dp.countryId === countryId &&
      JSON.stringify(dp.disaggregationSlice ?? {}) === sliceKey,
  )
}

export function createDataPoint(input: Omit<DataPoint, 'id' | 'status' | 'evidenceIds'> & {
  evidenceIds?: string[]
}): DataPoint {
  const dataPoint: DataPoint = {
    ...input,
    id: nextId('dp'),
    status: 'submitted',
    evidenceIds: input.evidenceIds ?? [],
    submittedAt: new Date().toISOString(),
  }
  state.dataPoints.push(dataPoint)
  addAuditLogEntry({
    entityType: 'DataPoint',
    entityId: dataPoint.id,
    actorId: dataPoint.submittedBy ?? 'unknown',
    action: 'submit',
    after: dataPoint,
  })
  return dataPoint
}

export function updateDataPointStatus(
  id: string,
  status: 'approved' | 'rejected',
  actorId: string,
  rejectionReason?: string,
): DataPoint | undefined {
  const dataPoint = state.dataPoints.find((dp) => dp.id === id)
  if (!dataPoint) return undefined

  const before = clone(dataPoint)
  dataPoint.status = status
  if (status === 'approved') {
    dataPoint.approvedBy = actorId
    dataPoint.approvedAt = new Date().toISOString()
  } else {
    dataPoint.rejectionReason = rejectionReason
  }
  addAuditLogEntry({
    entityType: 'DataPoint',
    entityId: dataPoint.id,
    actorId,
    action: status,
    before,
    after: dataPoint,
  })
  return dataPoint
}

// --- Imports (async job simulation) ---

const IMPORT_STAGE_DURATIONS_MS = { validating: 1000, importing: 2000, completed: 3000 }

function computeImportStatus(batch: ImportBatch): ImportBatch {
  if (batch.status === 'failed' || batch.status === 'completed') return batch

  const elapsed = Date.now() - Date.parse(batch.createdAt)
  const status: ImportBatch['status'] =
    elapsed < IMPORT_STAGE_DURATIONS_MS.validating
      ? 'queued'
      : elapsed < IMPORT_STAGE_DURATIONS_MS.importing
        ? 'validating'
        : elapsed < IMPORT_STAGE_DURATIONS_MS.completed
          ? 'importing'
          : 'completed'

  if (status !== batch.status) {
    batch.status = status
    if (status === 'completed') batch.completedAt = new Date().toISOString()
  }
  return batch
}

export function listImports(filters: { page?: number; pageSize?: number }) {
  const items = state.importBatches.map(computeImportStatus)
  const total = items.length
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 25
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), total, page, pageSize, hasMore: start + pageSize < total }
}

export function createImportBatch(options: {
  file: File
  type: ImportBatch['type']
  dryRun: boolean
  importedBy: string
}): ImportBatch {
  const rng = mulberry32(hashString(options.file.name + options.file.size))
  const rowsTotal = 10 + Math.floor(rng() * 40)
  const rowsRejected = Math.floor(rng() * Math.min(4, rowsTotal))
  const rowErrors: ImportRowError[] = Array.from({ length: rowsRejected }, (_, index) => ({
    row: index + 2,
    field: pick(rng, ['indicatorCode', 'period', 'value', 'countryId']),
    message: pick(rng, [
      'Unknown indicator code',
      'Malformed period',
      'Value out of range',
      'Missing required disaggregation',
    ]),
  }))

  const batch: ImportBatch = {
    id: nextId('imp'),
    type: options.type,
    sourceFile: options.file.name,
    importedBy: options.importedBy,
    status: 'queued',
    dryRun: options.dryRun,
    rowsAccepted: rowsTotal - rowsRejected,
    rowsRejected,
    rowErrors,
    createdAt: new Date().toISOString(),
  }
  state.importBatches.push(batch)
  addAuditLogEntry({
    entityType: 'ImportBatch',
    entityId: batch.id,
    actorId: options.importedBy,
    action: 'create',
    after: batch,
  })
  return batch
}

export function getImportBatchStatus(id: string): ImportBatch | undefined {
  const batch = state.importBatches.find((b) => b.id === id)
  return batch ? computeImportStatus(batch) : undefined
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash
}

// --- Users & auth ---

export function listUsers(): User[] {
  return state.users
}

export function getUserByEmail(email: string): User | undefined {
  return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function createSession(userId: string): string {
  const token = nextId('session')
  state.sessions.set(token, userId)
  return token
}

export function getUserBySession(token: string): User | undefined {
  const userId = state.sessions.get(token)
  return userId ? state.users.find((u) => u.id === userId) : undefined
}

export function toMe(user: User): Me {
  return { ...user, permissions: ROLE_PERMISSIONS[user.roleId] }
}

// --- Audit log ---

export function addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const full: AuditLogEntry = { ...entry, id: nextId('audit'), timestamp: new Date().toISOString() }
  state.auditLog.push(full)
  return full
}

// --- Reports (§8, computed server-side per the "never raw dumps" rule) ---

export function computeDashboardReport(filters: { programmeId?: string; period?: string }): DashboardReport {
  const period = filters.period ?? '2026-Q1'
  const scoped = filters.programmeId
    ? state.indicators.filter((i) => i.programmeId === filters.programmeId)
    : state.indicators

  const byResultLevel = Object.fromEntries(
    RESULT_LEVELS.map((level) => {
      const inLevel = scoped.filter((i) => i.resultLevel === level)
      const rollup: ResultLevelRollup = {
        total: inLevel.length,
        onTrack: inLevel.filter((i) => i.status === 'Ready').length,
        pending: inLevel.filter((i) => i.status !== 'Ready').length,
      }
      return [level, rollup]
    }),
  ) as DashboardReport['byResultLevel']

  const statusMix = Object.fromEntries(
    INDICATOR_STATUSES.map((status) => [status, scoped.filter((i) => i.status === status).length]),
  ) as DashboardReport['statusMix']

  const expectedThisPeriod = scoped.length
  const submitted = state.dataPoints.filter(
    (dp) => dp.period === period && scoped.some((i) => i.id === dp.indicatorId) && dp.status !== 'draft',
  ).length

  return {
    programmeId: filters.programmeId,
    period,
    byResultLevel,
    statusMix,
    completeness: {
      expectedThisPeriod,
      submitted,
      overdue: Math.max(0, expectedThisPeriod - submitted),
    },
  }
}

export function computeGenderIntegrationReport(period = '2026-Q1'): GenderIntegrationReport {
  const total = state.indicators.length
  const byLevel = Object.fromEntries(
    GENDER_INTEGRATION_LEVELS.map((level) => [
      level,
      state.indicators.filter((i) => i.genderIntegrationLevel === level).length,
    ]),
  ) as GenderIntegrationReport['byLevel']

  const intentionalOrTransformative = byLevel.Intentional + byLevel.Transformative

  return {
    period,
    totalIndicators: total,
    byLevel,
    intentionalOrTransformativePct: total === 0 ? 0 : Math.round((intentionalOrTransformative / total) * 1000) / 10,
  }
}

export function computeCompletenessReport(filters: { period?: string }): CompletenessReport {
  const period = filters.period ?? '2026-Q1'
  return {
    period,
    programmes: state.programmes.map((programme) => {
      const scoped = state.indicators.filter((i) => i.programmeId === programme.id)
      const submitted = state.dataPoints.filter(
        (dp) => dp.period === period && dp.status !== 'draft' && scoped.some((i) => i.id === dp.indicatorId),
      ).length
      return {
        programmeId: programme.id,
        expected: scoped.length,
        submitted,
        overdue: Math.max(0, scoped.length - submitted),
      }
    }),
  }
}
