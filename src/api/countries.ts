import type { Country } from '@/types/country'
import { apiRequest } from './client'
import type { Paginated } from './types'

export function listCountries(): Promise<Paginated<Country>> {
  return apiRequest<Country[]>('/countries')
}
