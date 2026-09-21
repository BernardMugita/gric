import { useQuery } from '@tanstack/react-query'
import { listDomains, listProgrammes } from '@/api/programmes'
import { queryKeys } from '@/api/queryKeys'
import { listIndicators, type IndicatorListParams } from '@/api/indicators'

export const CATALOG_PAGE_SIZE = 20

export function useIndicatorList(filters: IndicatorListParams) {
  return useQuery({
    queryKey: queryKeys.indicators.list(filters),
    queryFn: () => listIndicators(filters),
  })
}

export function useProgrammes() {
  return useQuery({ queryKey: queryKeys.programmes.all, queryFn: listProgrammes })
}

export function useDomainsForProgramme(programmeId: string | undefined) {
  return useQuery({
    queryKey: programmeId ? queryKeys.domains.byProgramme(programmeId) : ['programmes', 'none', 'domains'],
    queryFn: () => listDomains(programmeId as string),
    enabled: Boolean(programmeId),
  })
}
