import type { ImportStatus, ImportType } from './enums'

export interface ImportRowError {
  row: number
  sheet?: string
  field?: string
  message: string
}

export interface ImportBatch {
  id: string
  type: ImportType
  sourceFile: string
  importedBy: string
  status: ImportStatus
  dryRun: boolean
  rowsAccepted: number
  rowsRejected: number
  rowErrors: ImportRowError[]
  createdAt: string
  completedAt?: string
}
