import type { HttpHandler } from 'msw'

// Resource handlers are added here phase by phase (programmes, indicators,
// datapoints, imports, reports, auth) so this list mirrors src/api/*.ts 1:1.
export const handlers: HttpHandler[] = []
