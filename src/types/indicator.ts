import type { Baseline } from './baseline'
import type {
  GenderIntegrationLevel,
  IndicatorStatus,
  ResultLevel,
  SphereOfAccountability,
} from './enums'
import type { Frequency } from './frequency'
import type { Target } from './target'

export interface Indicator {
  id: string
  indicatorCode: string
  programmeId: string
  domainId: string
  resultLevel: ResultLevel
  resultStatement: string
  indicatorText: string
  monitoringQuestion: string
  dataSource: string
  frequency: Frequency
  responsibleRoleId: string
  /** DisaggregationDimension ids this indicator is sliced by. */
  disaggregationDims: string[]
  sphereOfAccountability: SphereOfAccountability
  genderIntegrationLevel: GenderIntegrationLevel
  status: IndicatorStatus
  evidenceRequired: boolean
  /**
   * Shared-Goal grouping id (FR-IT-4) — indicators across programmes that
   * feed the same convergence Goal carry the same id so rollups can dedupe
   * reach instead of double-counting it.
   */
  convergenceGroupId?: string
  currentVersion: number
  effectiveFrom: string
  baseline: Baseline
  targets: Target[]
}
