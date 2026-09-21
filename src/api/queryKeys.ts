// Centralized TanStack Query key factory — one place that knows the shape
// of every cache key, so invalidation after a mutation never has to guess.

import type { DataPointListParams } from './datapoints'
import type { IndicatorListParams } from './indicators'
import type { ListParams } from './types'

export const queryKeys = {
  countries: {
    all: ['countries'] as const,
  },
  programmes: {
    all: ['programmes'] as const,
  },
  domains: {
    byProgramme: (programmeId: string) => ['programmes', programmeId, 'domains'] as const,
  },
  indicators: {
    list: (filters: IndicatorListParams = {}) => ['indicators', filters] as const,
    detail: (id: string) => ['indicators', id] as const,
    dataPoints: (id: string, filters: ListParams = {}) =>
      ['indicators', id, 'datapoints', filters] as const,
  },
  dataPoints: {
    list: (filters: DataPointListParams = {}) => ['datapoints', filters] as const,
  },
  imports: {
    list: (filters: ListParams = {}) => ['imports', filters] as const,
    status: (id: string) => ['imports', id, 'status'] as const,
  },
  reports: {
    dashboard: (filters: ListParams = {}) => ['reports', 'dashboard', filters] as const,
    genderIntegration: (filters: ListParams = {}) =>
      ['reports', 'gender-integration', filters] as const,
    completeness: (filters: ListParams = {}) => ['reports', 'completeness', filters] as const,
  },
  users: {
    all: (filters: ListParams = {}) => ['users', filters] as const,
    me: ['me'] as const,
  },
}
