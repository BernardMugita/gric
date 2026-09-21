import type { Domain } from '@/types/domain'
import type { Programme } from '@/types/programme'
import { apiRequest } from './client'
import type { Paginated } from './types'

export function listProgrammes(): Promise<Paginated<Programme>> {
  return apiRequest<Programme[]>('/programmes')
}

export function listDomains(programmeId: string): Promise<Paginated<Domain>> {
  return apiRequest<Domain[]>(`/programmes/${programmeId}/domains`)
}
