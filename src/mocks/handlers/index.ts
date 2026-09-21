import { authHandlers } from './auth'
import { dataPointHandlers } from './datapoints'
import { importHandlers } from './imports'
import { indicatorHandlers } from './indicators'
import { programmeHandlers } from './programmes'
import { reportHandlers } from './reports'
import { userHandlers } from './users'

export const handlers = [
  ...programmeHandlers,
  ...indicatorHandlers,
  ...dataPointHandlers,
  ...importHandlers,
  ...reportHandlers,
  ...userHandlers,
  ...authHandlers,
]
