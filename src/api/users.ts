import type { User } from '@/types/user'
import { apiRequest } from './client'
import type { ListParams, Paginated } from './types'

export function listUsers(params: ListParams = {}): Promise<Paginated<User>> {
  return apiRequest<User[]>('/users', { params })
}
