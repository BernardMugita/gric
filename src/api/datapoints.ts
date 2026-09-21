import type { DataPoint } from '@/types/datapoint'
import type { DisaggregationSlice } from '@/types/disaggregation'
import type { IndicatorValue } from '@/types/value'
import { apiRequest } from './client'
import type { ApiErrorDetail, ApiEnvelope, ListParams, Paginated } from './types'

export interface DataPointListParams extends ListParams {
  indicatorId?: string
  status?: string
  countryId?: string
  periodFrom?: string
  periodTo?: string
}

export interface SubmitDataPointInput {
  indicatorId: string
  period: string
  countryId: string
  disaggregationSlice?: DisaggregationSlice
  value: IndicatorValue
  comment?: string
  evidenceIds?: string[]
  /** Omitted/'submitted' = canonical; 'draft' = incomplete work (FR-DC-3), not yet reported. */
  status?: 'draft' | 'submitted'
  /** Bypasses the duplicate-slice guard (FR-DC-6) to explicitly replace an existing submission. */
  revise?: boolean
  /** Required — the offline sync queue (FR-DC-8) depends on safe retries. */
  idempotencyKey: string
}

export interface BatchSubmitResult {
  created: DataPoint[]
  failed: { index: number; errors: ApiErrorDetail[] }[]
}

export function listDataPoints(params: DataPointListParams = {}): Promise<Paginated<DataPoint>> {
  return apiRequest<DataPoint[]>('/datapoints', { params })
}

export function submitDataPoint(input: SubmitDataPointInput): Promise<ApiEnvelope<DataPoint>> {
  const { idempotencyKey, ...body } = input
  return apiRequest<DataPoint>('/datapoints', { method: 'POST', body, idempotencyKey })
}

/** FR-API-9: one request for many rows — the bulk-entry grid and multi-category disaggregation submits. */
export function submitDataPointsBatch(items: SubmitDataPointInput[]): Promise<ApiEnvelope<BatchSubmitResult>> {
  return apiRequest<BatchSubmitResult>('/datapoints/batch', { method: 'POST', body: { items } })
}

export function reviewDataPoint(
  id: string,
  action: 'approve' | 'reject',
  rejectionReason?: string,
): Promise<ApiEnvelope<DataPoint>> {
  return apiRequest<DataPoint>(`/datapoints/${id}`, {
    method: 'PATCH',
    body: { status: action === 'approve' ? 'approved' : 'rejected', rejectionReason },
  })
}
