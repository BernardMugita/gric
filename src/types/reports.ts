import type { GenderIntegrationLevel, IndicatorStatus, ResultLevel } from './enums'

export interface ResultLevelRollup {
  total: number
  onTrack: number
  pending: number
}

export interface DashboardReport {
  programmeId?: string
  period: string
  byResultLevel: Record<ResultLevel, ResultLevelRollup>
  statusMix: Record<IndicatorStatus, number>
  completeness: {
    expectedThisPeriod: number
    submitted: number
    overdue: number
  }
}

export interface GenderIntegrationReport {
  period: string
  totalIndicators: number
  byLevel: Record<GenderIntegrationLevel, number>
  intentionalOrTransformativePct: number
}

export interface CompletenessProgrammeRow {
  programmeId: string
  expected: number
  submitted: number
  overdue: number
}

export interface CompletenessReport {
  period: string
  programmes: CompletenessProgrammeRow[]
}
