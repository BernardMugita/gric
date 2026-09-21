export interface AuditLogEntry {
  id: string
  entityType: string
  entityId: string
  actorId: string
  action: string
  before?: unknown
  after?: unknown
  timestamp: string
}
