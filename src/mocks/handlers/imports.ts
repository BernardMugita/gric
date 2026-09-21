import { http } from 'msw'
import type { ImportType } from '@/types/enums'
import * as db from '../db'
import { API_BASE, apiError, apiOk, requireUser } from './base'

export const importHandlers = [
  http.get(`${API_BASE}/imports`, ({ request }) => {
    const url = new URL(request.url)
    const raw = Object.fromEntries(url.searchParams.entries())
    const { items, total, page, pageSize, hasMore } = db.listImports({
      page: raw.page ? Number(raw.page) : undefined,
      pageSize: raw.pageSize ? Number(raw.pageSize) : undefined,
    })
    return apiOk(items, { total, page, pageSize, hasMore })
  }),

  http.post(`${API_BASE}/imports`, async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return apiError(422, [{ code: 'required', message: 'file is required', field: 'file' }])
    }
    const type = (formData.get('type') as ImportType | null) ?? 'bulkData'
    const dryRun = formData.get('dryRun') === 'true'
    const token = requireUser(request)
    const importedBy = (token ? db.getUserBySession(token)?.id : undefined) ?? 'unknown'

    const batch = db.createImportBatch({ file, type, dryRun, importedBy })
    return apiOk({ id: batch.id, status: batch.status }, {}, 202)
  }),

  http.get(`${API_BASE}/imports/:id/status`, ({ params }) => {
    const batch = db.getImportBatchStatus(params.id as string)
    if (!batch) return apiError(404, [{ code: 'not_found', message: 'Import batch not found' }])
    return apiOk(batch)
  }),
]
