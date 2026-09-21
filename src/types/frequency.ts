import type { FrequencyLabel } from './enums'

// Frequency is a rule, not just a label — "Milestone-based" indicators carry
// a free-text cadence like "6 and 12 months post-graduation" that the
// Scheduler still has to turn into concrete due dates (FR-MW-1).
export interface Frequency {
  label: FrequencyLabel
  cadenceRule?: string
}
