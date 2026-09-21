import type { Me } from '@/types/user'
import { apiRequest } from './client'
import type { ApiEnvelope } from './types'

export function login(email: string, password: string): Promise<ApiEnvelope<{ token: string; user: Me }>> {
  return apiRequest<{ token: string; user: Me }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getMe(): Promise<ApiEnvelope<Me>> {
  return apiRequest<Me>('/me')
}

export { setAuthTokenGetter } from './client'
