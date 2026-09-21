import type { Baseline } from '@/types/baseline'
import type { DataPoint } from '@/types/datapoint'
import type { Indicator } from '@/types/indicator'
import { apiRequest } from './client'
import type { ApiEnvelope, ListParams, Paginated } from './types'

export interface IndicatorListParams extends ListParams {
  programmeId?: string
  domainId?: string
  resultLevel?: string
  status?: string
  countryId?: string
  periodFrom?: string
  periodTo?: string
  sphereOfAccountability?: string
  genderIntegrationLevel?: string
  responsibleRoleId?: string
  convergenceGroupId?: string
}

export function listIndicators(params: IndicatorListParams = {}): Promise<Paginated<Indicator>> {
  return apiRequest<Indicator[]>('/indicators', { params })
}

export function getIndicator(id: string): Promise<ApiEnvelope<Indicator>> {
  return apiRequest<Indicator>(`/indicators/${id}`)
}

export function listIndicatorDataPoints(
  id: string,
  params: ListParams = {},
): Promise<Paginated<DataPoint>> {
  return apiRequest<DataPoint[]>(`/indicators/${id}/datapoints`, { params })
}

export type ReviseBaselineInput = Omit<Baseline, 'id' | 'indicatorId' | 'version' | 'previousVersionId'>

/** FR-DC-9: establish/revise a baseline — the prior value is preserved via the audit log, never overwritten silently. */
export function reviseBaseline(indicatorId: string, input: ReviseBaselineInput): Promise<ApiEnvelope<Indicator>> {
  return apiRequest<Indicator>(`/indicators/${indicatorId}/baseline`, { method: 'PATCH', body: input })
}
