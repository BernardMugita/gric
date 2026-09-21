import { http } from 'msw'
import * as db from '../db'
import { API_BASE, apiOk } from './base'

export const reportHandlers = [
  http.get(`${API_BASE}/reports/dashboard`, ({ request }) => {
    const url = new URL(request.url)
    const report = db.computeDashboardReport({
      programmeId: url.searchParams.get('programmeId') ?? undefined,
      period: url.searchParams.get('period') ?? undefined,
    })
    return apiOk(report, { generatedAt: new Date().toISOString() })
  }),

  http.get(`${API_BASE}/reports/gender-integration`, ({ request }) => {
    const url = new URL(request.url)
    const report = db.computeGenderIntegrationReport(url.searchParams.get('period') ?? undefined)
    return apiOk(report, { generatedAt: new Date().toISOString() })
  }),

  http.get(`${API_BASE}/reports/completeness`, ({ request }) => {
    const url = new URL(request.url)
    const report = db.computeCompletenessReport({ period: url.searchParams.get('period') ?? undefined })
    return apiOk(report, { generatedAt: new Date().toISOString() })
  }),
]
