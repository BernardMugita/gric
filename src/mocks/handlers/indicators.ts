import { http } from 'msw'
import type { Baseline } from '@/types/baseline'
import * as db from '../db'
import { API_BASE, apiError, apiOk, requireUser } from './base'

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

  http.patch(`${API_BASE}/indicators/:id/baseline`, async ({ params, request }) => {
    const body = (await request.json()) as Partial<Baseline>
    if (!body.valueType || !body.asOfDate) {
      return apiError(422, [
        { code: 'required', message: 'valueType and asOfDate are required', field: 'valueType' },
      ])
    }
    const token = requireUser(request)
    const actorId = (token ? db.getUserBySession(token)?.id : undefined) ?? 'unknown'

    const updated = db.reviseBaseline(params.id as string, actorId, {
      valueType: body.valueType,
      numericValue: body.numericValue,
      narrativeText: body.narrativeText,
      asOfDate: body.asOfDate,
      source: body.source,
      note: body.note,
      establishedBy: actorId,
    })
    if (!updated) return apiError(404, [{ code: 'not_found', message: 'Indicator not found' }])
    return apiOk(updated)
  }),
]
