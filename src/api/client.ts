import type { ApiEnvelope, ApiErrorDetail } from './types'

// Defaults to the same base MSW's handlers are registered under
// (src/mocks/handlers/base.ts) — pointing this at a real backend later is
// the only change needed to stop using the mock.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1'

let authTokenGetter: () => string | null = () => null

/** Wired up by the auth store once it exists; until then requests go out unauthenticated. */
export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter
}

export class ApiRequestError extends Error {
  status: number
  errors: ApiErrorDetail[]

  constructor(status: number, errors: ApiErrorDetail[]) {
    super(errors[0]?.message ?? `API request failed with status ${status}`)
    this.name = 'ApiRequestError'
    this.status = status
    this.errors = errors
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  /** FR-API-10: carried as an `Idempotency-Key` header on write requests. */
  idempotencyKey?: string
  signal?: AbortSignal
}

function buildUrl(path: string, params?: ApiRequestOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }
  return url.pathname + url.search
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const { method = 'GET', params, body, idempotencyKey, signal } = options
  const token = authTokenGetter()

  const response = await fetch(buildUrl(path, params), {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const envelope = (await response.json()) as ApiEnvelope<T>

  if (!response.ok || envelope.errors?.length) {
    throw new ApiRequestError(
      response.status,
      envelope.errors?.length
        ? envelope.errors
        : [{ code: 'unknown_error', message: 'Request failed' }],
    )
  }

  return envelope
}

/** For multipart writes — currently just import uploads (FR-API-9). */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options: Pick<ApiRequestOptions, 'idempotencyKey' | 'signal'> = {},
): Promise<ApiEnvelope<T>> {
  const token = authTokenGetter()

  const response = await fetch(buildUrl(path), {
    method: 'POST',
    signal: options.signal,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    },
    body: formData,
  })

  const envelope = (await response.json()) as ApiEnvelope<T>

  if (!response.ok || envelope.errors?.length) {
    throw new ApiRequestError(
      response.status,
      envelope.errors?.length
        ? envelope.errors
        : [{ code: 'unknown_error', message: 'Upload failed' }],
    )
  }

  return envelope
}
