import type { ImportType } from '@/types/enums'
import type { ImportBatch } from '@/types/importBatch'
import { apiRequest, apiUpload } from './client'
import type { ApiEnvelope, ListParams, Paginated } from './types'

export function listImports(params: ListParams = {}): Promise<Paginated<ImportBatch>> {
  return apiRequest<ImportBatch[]>('/imports', { params })
}

export function startImport(
  file: File,
  type: ImportType,
  dryRun = false,
): Promise<ApiEnvelope<{ id: string; status: ImportBatch['status'] }>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('dryRun', String(dryRun))
  return apiUpload<{ id: string; status: ImportBatch['status'] }>('/imports', formData)
}

export function getImportStatus(id: string): Promise<ApiEnvelope<ImportBatch>> {
  return apiRequest<ImportBatch>(`/imports/${id}/status`)
}
