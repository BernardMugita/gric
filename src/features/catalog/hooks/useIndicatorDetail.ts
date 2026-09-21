import { useQuery } from '@tanstack/react-query'
import { getIndicator, listIndicatorDataPoints, listIndicators } from '@/api/indicators'
import { queryKeys } from '@/api/queryKeys'

export function useIndicator(id: string) {
  return useQuery({
    queryKey: queryKeys.indicators.detail(id),
    queryFn: () => getIndicator(id),
  })
}

export function useIndicatorDataPoints(id: string) {
  return useQuery({
    queryKey: queryKeys.indicators.dataPoints(id),
    queryFn: () => listIndicatorDataPoints(id),
  })
}

/** Every indicator in the same Domain — feeds the results-chain breadcrumb (FR-IT-3). */
export function useIndicatorsInDomain(domainId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.indicators.list({ domainId, pageSize: 500 }),
    queryFn: () => listIndicators({ domainId, pageSize: 500 }),
    enabled: Boolean(domainId),
  })
}

/** Sibling indicators sharing a convergence Goal across domains/programmes (FR-IT-4). */
export function useConvergenceGroup(convergenceGroupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.indicators.list({ convergenceGroupId, pageSize: 50 }),
    queryFn: () => listIndicators({ convergenceGroupId, pageSize: 50 }),
    enabled: Boolean(convergenceGroupId),
  })
}
