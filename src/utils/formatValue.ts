import type { IndicatorValue } from '@/types/value'

export function formatIndicatorValue(value: IndicatorValue): string {
  switch (value.valueType) {
    case 'numeric':
      return value.numericValue !== undefined ? String(value.numericValue) : '—'
    case 'percentage':
      return value.numericValue !== undefined ? `${value.numericValue}%` : '—'
    case 'narrative':
      return value.narrativeText ?? '—'
    case 'notYetTracked':
      return 'Not yet tracked'
    default:
      return '—'
  }
}
