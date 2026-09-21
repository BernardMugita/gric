import type { DisaggregationDimensionName } from './enums'

export interface DisaggregationDimension {
  id: string
  name: DisaggregationDimensionName
  allowedValues: string[]
}

// e.g. { sex: 'Female', country: 'KE' } — keyed by DisaggregationDimension id.
export type DisaggregationSlice = Record<string, string>
