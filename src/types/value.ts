import type { ValueType } from './enums'

// Shared shape for anything that can be "a number, a percentage, a phrase,
// or honestly not tracked yet" — Baseline, Target and DataPoint.value all
// reuse this (FRD §3 note on non-numeric baselines/targets; §13 sample
// payloads nest DataPoint.value the same way).
export interface IndicatorValue {
  valueType: ValueType
  numericValue?: number
  narrativeText?: string
}
