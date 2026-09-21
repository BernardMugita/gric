import type { DisaggregationDimension } from '@/types/disaggregation'
import { apiRequest } from './client'
import type { Paginated } from './types'

export function listDisaggregationDimensions(): Promise<Paginated<DisaggregationDimension>> {
  return apiRequest<DisaggregationDimension[]>('/disaggregation-dimensions')
}
