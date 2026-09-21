import { http } from 'msw'
import * as db from '../db'
import { API_BASE, apiError, apiOk, requireUser } from './base'

export const evidenceHandlers = [
  http.post(`${API_BASE}/evidence`, async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return apiError(422, [{ code: 'required', message: 'file is required', field: 'file' }])
    }
    const token = requireUser(request)
    const uploadedBy = (token ? db.getUserBySession(token)?.id : undefined) ?? 'unknown'
    const evidence = db.createEvidence({ file, uploadedBy })
    return apiOk(evidence, {}, 201)
  }),
]
