const resolveApiBase = () => {
  const envValue = import.meta.env.VITE_API_URL?.trim()
  if (envValue) return envValue
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const port = 8000
    return `${protocol}//${hostname}:${port}`
  }
  return 'http://localhost:8000'
}

export const API_BASE = resolveApiBase().replace(/\/+$/, '')

async function safeFetch(url, options = {}) {
  const finalOptions = {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  }

  const res = await fetch(url, finalOptions)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  if (res.status === 204) {
    return null
  }
  return res.json()
}

export async function simulateProperty(payload, seed) {
  const qs = seed != null ? `?seed=${seed}` : ''
  return safeFetch(`${API_BASE}/simulate/property${qs}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function simulatePortfolio(payload, sims = 500, seed) {
  const params = new URLSearchParams()
  if (sims) params.set('sims', String(sims))
  if (seed != null) params.set('seed', String(seed))
  const query = params.toString()
  const qs = query ? `?${query}` : ''
  return safeFetch(`${API_BASE}/simulate/portfolio${qs}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function addProperty(prop) {
  return safeFetch(`${API_BASE}/portfolio`, {
    method: 'POST',
    body: JSON.stringify(prop),
  })
}

export async function listPortfolio() {
  return safeFetch(`${API_BASE}/portfolio`)
}

export async function clearPortfolio() {
  return safeFetch(`${API_BASE}/portfolio`, { method: 'DELETE' })
}
