import { http } from 'msw'
import * as db from '../db'
import { API_BASE, apiError, apiOk } from './base'

function paramsToObject(url: URL): Record<string, string> {
  return Object.fromEntries(url.searchParams.entries())
}

export const indicatorHandlers = [
  http.get(`${API_BASE}/indicators`, ({ request }) => {
    const url = new URL(request.url)
    const raw = paramsToObject(url)
    const { items, total, page, pageSize, hasMore } = db.listIndicators({
      ...raw,
      page: raw.page ? Number(raw.page) : undefined,
      pageSize: raw.pageSize ? Number(raw.pageSize) : undefined,
    })
    return apiOk(items, { total, page, pageSize, hasMore })
  }),

  http.get(`${API_BASE}/indicators/:id`, ({ params }) => {
    const indicator = db.getIndicator(params.id as string)
    if (!indicator) return apiError(404, [{ code: 'not_found', message: 'Indicator not found' }])
    return apiOk(indicator)
  }),

  http.get(`${API_BASE}/indicators/:id/datapoints`, ({ params }) => {
    const indicator = db.getIndicator(params.id as string)
    if (!indicator) return apiError(404, [{ code: 'not_found', message: 'Indicator not found' }])
    const items = db.listIndicatorDataPoints(params.id as string)
    return apiOk(items, { total: items.length })
  }),
]
