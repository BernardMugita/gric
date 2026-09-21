import { authHandlers } from './auth'
import { countryHandlers } from './countries'
import { dataPointHandlers } from './datapoints'
import { disaggregationHandlers } from './disaggregations'
import { evidenceHandlers } from './evidence'
import { importHandlers } from './imports'
import { indicatorHandlers } from './indicators'
import { programmeHandlers } from './programmes'
import { reportHandlers } from './reports'
import { userHandlers } from './users'

export const handlers = [
  ...countryHandlers,
  ...disaggregationHandlers,
  ...programmeHandlers,
  ...indicatorHandlers,
  ...dataPointHandlers,
  ...evidenceHandlers,
  ...importHandlers,
  ...reportHandlers,
  ...userHandlers,
  ...authHandlers,
]
