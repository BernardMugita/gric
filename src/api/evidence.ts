import type { EvidenceAttachment } from '@/types/evidence'
import { apiUpload } from './client'
import type { ApiEnvelope } from './types'

export function uploadEvidence(file: File): Promise<ApiEnvelope<EvidenceAttachment>> {
  const formData = new FormData()
  formData.append('file', file)
  return apiUpload<EvidenceAttachment>('/evidence', formData)
}
