import { HttpResponse } from 'msw'
import type { ApiErrorDetail } from '@/api/types'

// Must match the default in src/api/client.ts.
export const API_BASE = '/api/v1'

export function apiError(status: number, errors: ApiErrorDetail[]) {
  return HttpResponse.json({ data: null, meta: {}, errors }, { status })
}

export function apiOk<T>(data: T, meta: Record<string, unknown> = {}, status = 200) {
  return HttpResponse.json({ data, meta, errors: [] }, { status })
}

export function requireUser(request: Request) {
  const header = request.headers.get('Authorization')
  const token = header?.replace(/^Bearer\s+/i, '')
  return token
}
