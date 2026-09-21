import type { IndicatorValue } from './value'

// Baselines are versioned, never overwritten (FR-DC-9, NFR-4): revising a
// baseline creates a new row pointing back at the one it supersedes.
export interface Baseline extends IndicatorValue {
  id: string
  indicatorId: string
  asOfDate: string
  source?: string
  note?: string
  establishedBy?: string
  version: number
  previousVersionId?: string
}
