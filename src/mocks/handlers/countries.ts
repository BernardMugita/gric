import { http } from 'msw'
import { countries } from '../data/countries'
import { API_BASE, apiOk } from './base'

export const countryHandlers = [
  http.get(`${API_BASE}/countries`, () => apiOk(countries, { total: countries.length })),
]
