export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(errorMessage(data) || `HTTP ${status}`)
    this.status = status
    this.data = data
  }

  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {}
    if (this.data && typeof this.data === 'object' && !Array.isArray(this.data)) {
      for (const [key, value] of Object.entries(this.data as Record<string, unknown>)) {
        if (key === 'detail' || key === 'code') continue
        out[key] = Array.isArray(value) ? value.join(' ') : String(value)
      }
    }
    return out
  }
}

function errorMessage(data: unknown): string {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map(errorMessage).join(' ')
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (obj.detail) return String(obj.detail)
    if (obj.non_field_errors) return errorMessage(obj.non_field_errors)
    return Object.values(obj).map(errorMessage).filter(Boolean).join(' ')
  }
  return String(data)
}

let refreshing: Promise<boolean> | null = null
let onUnauthorized: () => void = () => undefined

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1]
}

async function refresh(): Promise<boolean> {
  refreshing ??= fetch('/api/core/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0))
  return refreshing
}

type Params = Record<string, string | number | boolean | null | undefined | (string | number)[]>

export function buildQuery(params?: Params) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  const s = search.toString()
  return s ? `?${s}` : ''
}

export async function request<T = unknown>(
  method: string,
  url: string,
  body?: unknown,
  params?: Params,
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const lang = localStorage.getItem('lang')
  if (lang) headers['Accept-Language'] = lang
  const csrf = getCookie('csrftoken')
  if (csrf) headers['X-CSRFToken'] = csrf
  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  const response = await fetch(`/api${url}${buildQuery(params)}`, {
    method,
    headers,
    body: payload,
    credentials: 'include',
  })
  if (response.status === 401 && retry && !url.startsWith('/core/auth/')) {
    if (await refresh()) return request<T>(method, url, body, params, false)
    onUnauthorized()
  }
  const text = await response.text()
  const data = text ? safeJson(text) : null
  if (!response.ok) throw new ApiError(response.status, data)
  return data as T
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  get: <T = unknown>(url: string, params?: Params) => request<T>('GET', url, undefined, params),
  post: <T = unknown>(url: string, body?: unknown) => request<T>('POST', url, body ?? {}),
  put: <T = unknown>(url: string, body?: unknown) => request<T>('PUT', url, body),
  patch: <T = unknown>(url: string, body?: unknown) => request<T>('PATCH', url, body),
  delete: <T = unknown>(url: string, body?: unknown) => request<T>('DELETE', url, body),
}

export interface Page<T> {
  count: number
  pages: number
  page: number
  results: T[]
}
