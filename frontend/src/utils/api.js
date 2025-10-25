const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function simulateProperty(payload) {
  const res = await fetch(`${API_BASE}/simulate/property`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function simulatePortfolio(payload, simulations = 500) {
  const res = await fetch(`${API_BASE}/simulate/portfolio?simulations=${simulations}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function addProperty(prop) {
  const res = await fetch(`${API_BASE}/portfolio`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop)
  });
  return res.json();
}

export async function listPortfolio() {
  const res = await fetch(`${API_BASE}/portfolio`);
  return res.json();
}

export async function clearPortfolio() {
  const res = await fetch(`${API_BASE}/portfolio`, { method: 'DELETE' });
  return res.json();
}
