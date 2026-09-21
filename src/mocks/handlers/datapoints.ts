import { http } from 'msw'
import type { ApiErrorDetail } from '@/api/types'
import type { DataPoint } from '@/types/datapoint'
import * as db from '../db'
import { API_BASE, apiError, apiOk, requireUser } from './base'

interface SubmitBody {
  indicatorId?: string
  period?: string
  countryId?: string
  disaggregationSlice?: DataPoint['disaggregationSlice']
  value?: DataPoint['value']
  comment?: string
  evidenceIds?: string[]
  revise?: boolean
}

function validate(body: SubmitBody): ApiErrorDetail[] {
  const errors: ApiErrorDetail[] = []
  if (!body.indicatorId) errors.push({ code: 'required', message: 'indicatorId is required', field: 'indicatorId' })
  if (!body.period) errors.push({ code: 'required', message: 'period is required', field: 'period' })
  if (!body.countryId) errors.push({ code: 'required', message: 'countryId is required', field: 'countryId' })
  if (!body.value) {
    errors.push({ code: 'required', message: 'value is required', field: 'value' })
  } else if (
    body.value.valueType === 'percentage' &&
    body.value.numericValue !== undefined &&
    (body.value.numericValue < 0 || body.value.numericValue > 100)
  ) {
    errors.push({ code: 'out_of_range', message: 'Percentage must be between 0 and 100', field: 'value.numericValue' })
  }
  return errors
}

export const dataPointHandlers = [
  http.get(`${API_BASE}/datapoints`, ({ request }) => {
    const url = new URL(request.url)
    const raw = Object.fromEntries(url.searchParams.entries())
    const { items, total, page, pageSize, hasMore } = db.listDataPoints({
      ...raw,
      page: raw.page ? Number(raw.page) : undefined,
      pageSize: raw.pageSize ? Number(raw.pageSize) : undefined,
    })
    return apiOk(items, { total, page, pageSize, hasMore })
  }),

  http.post(`${API_BASE}/datapoints`, async ({ request }) => {
    const body = (await request.json()) as SubmitBody
    const idempotencyKey = request.headers.get('Idempotency-Key') ?? undefined

    if (idempotencyKey) {
      const existing = db.findDataPointByIdempotencyKey(idempotencyKey)
      if (existing) return apiOk(existing)
    }

    const errors = validate(body)
    if (errors.length) return apiError(422, errors)

    if (!body.revise) {
      const duplicate = db.findDuplicateDataPoint(
        body.indicatorId!,
        body.period!,
        body.countryId!,
        body.disaggregationSlice ?? {},
      )
      if (duplicate) {
        return apiError(409, [
          {
            code: 'duplicate_datapoint',
            message: 'A data point already exists for this indicator, period and slice. Resubmit with revise=true to replace it.',
          },
        ])
      }
    }

    const token = requireUser(request)
    const submittedBy = token ? db.getUserBySession(token)?.id : undefined

    const created = db.createDataPoint({
      indicatorId: body.indicatorId!,
      period: body.period!,
      countryId: body.countryId!,
      disaggregationSlice: body.disaggregationSlice ?? {},
      value: body.value!,
      comment: body.comment,
      evidenceIds: body.evidenceIds ?? [],
      submittedBy,
      idempotencyKey,
    })
    return apiOk(created, {}, 201)
  }),

  http.patch(`${API_BASE}/datapoints/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { status?: 'approved' | 'rejected'; rejectionReason?: string }
    if (body.status !== 'approved' && body.status !== 'rejected') {
      return apiError(422, [{ code: 'invalid_status', message: 'status must be approved or rejected', field: 'status' }])
    }
    const token = requireUser(request)
    const actorId = (token ? db.getUserBySession(token)?.id : undefined) ?? 'unknown'
    const updated = db.updateDataPointStatus(params.id as string, body.status, actorId, body.rejectionReason)
    if (!updated) return apiError(404, [{ code: 'not_found', message: 'DataPoint not found' }])
    return apiOk(updated)
  }),
]
