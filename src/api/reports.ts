import type {
  CompletenessReport,
  DashboardReport,
  GenderIntegrationReport,
} from '@/types/reports'
import { apiRequest } from './client'
import type { ApiEnvelope, ListParams } from './types'

export function getDashboardReport(params: ListParams = {}): Promise<ApiEnvelope<DashboardReport>> {
  return apiRequest<DashboardReport>('/reports/dashboard', { params })
}

export function getGenderIntegrationReport(
  params: ListParams = {},
): Promise<ApiEnvelope<GenderIntegrationReport>> {
  return apiRequest<GenderIntegrationReport>('/reports/gender-integration', { params })
}

export function getCompletenessReport(
  params: ListParams = {},
): Promise<ApiEnvelope<CompletenessReport>> {
  return apiRequest<CompletenessReport>('/reports/completeness', { params })
}
