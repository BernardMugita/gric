import type { IndicatorValue } from './value'

export interface Target extends IndicatorValue {
  id: string
  indicatorId: string
  period: string
}
