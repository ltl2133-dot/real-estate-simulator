// frontend/src/utils/api.js
const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://real-estate-simulator-0rv6.onrender.com')
  .replace(/\/+$/, '');

async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Request failed ${res.status}: ${msg}`);
  }
  return res.json();
}

export async function simulateProperty(payload) {
  return safeFetch(`${API_BASE}/simulate/property`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function simulatePortfolio(payload, sims = 500) {
  return safeFetch(`${API_BASE}/simulate/portfolio?sims=${sims}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function addProperty(prop) {
  return safeFetch(`${API_BASE}/portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  });
}

export async function listPortfolio() {
  return safeFetch(`${API_BASE}/portfolio`);
}

export async function clearPortfolio() {
  return safeFetch(`${API_BASE}/portfolio`, { method: 'DELETE' });
}