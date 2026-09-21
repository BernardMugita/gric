import type { ValueType } from '@/types/enums'
import type { Indicator } from '@/types/indicator'

/**
 * What kind of value should this indicator's DataPoints carry? The baseline
 * is the source of truth unless it's a placeholder ("notYetTracked") or
 * itself narrative — in that case fall back to the first target that
 * actually commits to a reportable type, defaulting to numeric.
 */
export function getIndicatorValueType(indicator: Indicator): Exclude<ValueType, 'notYetTracked'> {
  if (indicator.baseline.valueType === 'numeric' || indicator.baseline.valueType === 'percentage') {
    return indicator.baseline.valueType
  }
  const target = indicator.targets.find((t) => t.valueType === 'numeric' || t.valueType === 'percentage')
  if (target) return target.valueType as 'numeric' | 'percentage'
  if (indicator.baseline.valueType === 'narrative') return 'narrative'
  const narrativeTarget = indicator.targets.find((t) => t.valueType === 'narrative')
  if (narrativeTarget) return 'narrative'
  return 'numeric'
}
