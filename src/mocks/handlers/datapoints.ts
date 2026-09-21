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
  status?: 'draft' | 'submitted'
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

type CreateResult =
  | { ok: true; dataPoint: DataPoint }
  | { ok: false; status: number; errors: ApiErrorDetail[] }

/** Shared by the single-row and batch endpoints so both enforce identical rules. */
function createOne(body: SubmitBody, idempotencyKey: string | undefined, submittedBy: string | undefined): CreateResult {
  if (idempotencyKey) {
    const existing = db.findDataPointByIdempotencyKey(idempotencyKey)
    if (existing) return { ok: true, dataPoint: existing }
  }

  const errors = validate(body)
  if (errors.length) return { ok: false, status: 422, errors }

  // Drafts are "incomplete work" (FR-DC-3) — the duplicate guard (FR-DC-6) only
  // protects canonical/submitted records from being silently doubled.
  if (body.status !== 'draft' && !body.revise) {
    const duplicate = db.findDuplicateDataPoint(
      body.indicatorId!,
      body.period!,
      body.countryId!,
      body.disaggregationSlice ?? {},
    )
    if (duplicate) {
      return {
        ok: false,
        status: 409,
        errors: [
          {
            code: 'duplicate_datapoint',
            message: 'A data point already exists for this indicator, period and slice. Resubmit with revise=true to replace it.',
          },
        ],
      }
    }
  }

  const dataPoint = db.createDataPoint({
    indicatorId: body.indicatorId!,
    period: body.period!,
    countryId: body.countryId!,
    disaggregationSlice: body.disaggregationSlice ?? {},
    value: body.value!,
    comment: body.comment,
    evidenceIds: body.evidenceIds ?? [],
    submittedBy,
    idempotencyKey,
    status: body.status === 'draft' ? 'draft' : undefined,
  })
  return { ok: true, dataPoint }
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
    const token = requireUser(request)
    const submittedBy = token ? db.getUserBySession(token)?.id : undefined

    const result = createOne(body, idempotencyKey, submittedBy)
    if (!result.ok) return apiError(result.status, result.errors)
    return apiOk(result.dataPoint, {}, 201)
  }),

  // FR-API-9: one request for the bulk-entry grid (and multi-category
  // disaggregation submits) instead of N separate POSTs.
  http.post(`${API_BASE}/datapoints/batch`, async ({ request }) => {
    const body = (await request.json()) as { items?: (SubmitBody & { idempotencyKey?: string })[] }
    const items = body.items ?? []
    const token = requireUser(request)
    const submittedBy = token ? db.getUserBySession(token)?.id : undefined

    const created: DataPoint[] = []
    const failed: { index: number; errors: ApiErrorDetail[] }[] = []

    items.forEach((item, index) => {
      const result = createOne(item, item.idempotencyKey, submittedBy)
      if (result.ok) created.push(result.dataPoint)
      else failed.push({ index, errors: result.errors })
    })

    return apiOk({ created, failed }, {}, failed.length > 0 && created.length === 0 ? 422 : 201)
  }),

  http.patch(`${API_BASE}/datapoints/:id`, async ({ params, request }) => {
    const body = (await request.json()) as {
      status?: 'submitted' | 'approved' | 'rejected'
      rejectionReason?: string
    }
    if (!body.status || !['submitted', 'approved', 'rejected'].includes(body.status)) {
      return apiError(422, [{ code: 'invalid_status', message: 'status must be submitted, approved or rejected', field: 'status' }])
    }
    const token = requireUser(request)
    const actorId = (token ? db.getUserBySession(token)?.id : undefined) ?? 'unknown'

    if (body.status === 'submitted') {
      const updated = db.submitDraft(params.id as string, actorId)
      if (!updated) return apiError(404, [{ code: 'not_found', message: 'DataPoint not found' }])
      return apiOk(updated)
    }

    const updated = db.updateDataPointStatus(params.id as string, body.status, actorId, body.rejectionReason)
    if (!updated) return apiError(404, [{ code: 'not_found', message: 'DataPoint not found' }])
    return apiOk(updated)
  }),
]
