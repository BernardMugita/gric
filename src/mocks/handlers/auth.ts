import { http } from 'msw'
import * as db from '../db'
import { API_BASE, apiError, apiOk, requireUser } from './base'

export const authHandlers = [
  // Any password is accepted for a known demo email — there's no real
  // backend yet (see mocks/data/users.ts for the account list).
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string }
    const user = body.email ? db.getUserByEmail(body.email) : undefined
    if (!user) {
      return apiError(401, [{ code: 'invalid_credentials', message: 'Unknown email address' }])
    }
    const token = db.createSession(user.id)
    return apiOk({ token, user: db.toMe(user) })
  }),

  http.get(`${API_BASE}/me`, ({ request }) => {
    const token = requireUser(request)
    const user = token ? db.getUserBySession(token) : undefined
    if (!user) {
      return apiError(401, [{ code: 'unauthorized', message: 'Not authenticated' }])
    }
    return apiOk(db.toMe(user))
  }),
]
