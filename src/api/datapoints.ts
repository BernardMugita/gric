import type { DataPoint } from '@/types/datapoint'
import type { DisaggregationSlice } from '@/types/disaggregation'
import type { IndicatorValue } from '@/types/value'
import { apiRequest } from './client'
import type { ApiEnvelope, ListParams, Paginated } from './types'

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
  /** Required — the offline sync queue (FR-DC-8) depends on safe retries. */
  idempotencyKey: string
}

export function listDataPoints(params: DataPointListParams = {}): Promise<Paginated<DataPoint>> {
  return apiRequest<DataPoint[]>('/datapoints', { params })
}

export function submitDataPoint(input: SubmitDataPointInput): Promise<ApiEnvelope<DataPoint>> {
  const { idempotencyKey, ...body } = input
  return apiRequest<DataPoint>('/datapoints', { method: 'POST', body, idempotencyKey })
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
