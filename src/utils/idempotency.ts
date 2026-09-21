/** Generates a client-side key so retries (offline sync, flaky connections) never double-submit (FR-API-10). */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`
}
