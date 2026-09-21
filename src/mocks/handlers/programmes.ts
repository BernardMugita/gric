import { http } from 'msw'
import * as db from '../db'
import { API_BASE, apiOk } from './base'

export const programmeHandlers = [
  http.get(`${API_BASE}/programmes`, () => {
    const items = db.listProgrammes()
    return apiOk(items, { total: items.length })
  }),

  http.get(`${API_BASE}/programmes/:programmeId/domains`, ({ params }) => {
    const items = db.listDomains(params.programmeId as string)
    return apiOk(items, { total: items.length })
  }),
]
