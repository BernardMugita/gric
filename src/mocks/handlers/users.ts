import { http } from 'msw'
import * as db from '../db'
import { API_BASE, apiOk } from './base'

export const userHandlers = [
  http.get(`${API_BASE}/users`, () => {
    const items = db.listUsers()
    return apiOk(items, { total: items.length })
  }),
]
