// Wire-level shapes from FRD §9 — every endpoint returns this envelope,
// list endpoints populate `meta` with pagination, and errors (validation or
// system) always come back as ApiErrorDetail[], never a bare throw.

export interface ApiErrorDetail {
  code: string
  message: string
  field?: string
}

export interface PaginationMeta {
  page?: number
  pageSize?: number
  total?: number
  hasMore?: boolean
  cursor?: string | null
  nextCursor?: string | null
}

export interface ApiEnvelope<T> {
  data: T
  meta: PaginationMeta & Record<string, unknown>
  errors: ApiErrorDetail[]
}

export type Paginated<T> = ApiEnvelope<T[]>

export interface ListParams {
  page?: number
  pageSize?: number
  cursor?: string
  sort?: string
  [key: string]: string | number | boolean | undefined
}
