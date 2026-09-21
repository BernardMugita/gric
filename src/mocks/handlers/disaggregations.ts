import { http } from 'msw'
import { disaggregationDimensions } from '../data/disaggregations'
import { API_BASE, apiOk } from './base'

export const disaggregationHandlers = [
  http.get(`${API_BASE}/disaggregation-dimensions`, () =>
    apiOk(disaggregationDimensions, { total: disaggregationDimensions.length }),
  ),
]
