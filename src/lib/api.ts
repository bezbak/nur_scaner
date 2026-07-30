export const API_BASE_KEY = 'ticket_verifier_api_base'
export const TOKEN_KEY = 'ticket_verifier_token'
export const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://site.nur.webtm.ru/api/v1/'

export type ApiError = Error & { status?: number; data?: unknown }

export function normalizeApiBase(value: string) {
  let next = value.trim()
  if (!next) next = DEFAULT_API_BASE
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(next)) next = `http://${next}`
  const url = new URL(next)
  if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`
  return url.toString()
}

export function getApiBase() {
  return normalizeApiBase(localStorage.getItem(API_BASE_KEY) || DEFAULT_API_BASE)
}

export function saveApiBase(value: string) {
  const normalized = normalizeApiBase(value)
  localStorage.setItem(API_BASE_KEY, normalized)
  return normalized
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function buildApiUrl(path: string) {
  const value = path.trim()
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) return value

  const base = getApiBase()
  const basePath = new URL(base).pathname.replace(/^\/+|\/+$/g, '')
  let nextPath = value.replace(/^\/+/, '')

  if (basePath && (nextPath === basePath || nextPath.startsWith(`${basePath}/`) || nextPath.startsWith(`${basePath}?`) || nextPath.startsWith(`${basePath}#`))) {
    nextPath = nextPath.slice(basePath.length).replace(/^\/+/, '')
  }

  return new URL(nextPath, base).toString()
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(buildApiUrl(path), { ...init, headers })
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    const error = new Error(typeof data === 'object' && data && 'detail' in data ? String(data.detail) : 'Ошибка API') as ApiError
    error.status = response.status
    error.data = data
    throw error
  }
  return data as T
}

export function tokenFromQr(value: string) {
  try {
    const url = new URL(value)
    const parts = url.pathname.split('/').filter(Boolean)
    const idx = parts.indexOf('ticket')
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1]
  } catch {
    // raw token fallback
  }
  return value.trim()
}
