import type { DataPointStatus } from './enums'
import type { DisaggregationSlice } from './disaggregation'
import type { IndicatorValue } from './value'

export interface DataPoint {
  id: string
  indicatorId: string
  period: string
  countryId: string
  disaggregationSlice: DisaggregationSlice
  value: IndicatorValue
  status: DataPointStatus
  comment?: string
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  evidenceIds: string[]
  idempotencyKey?: string
}
