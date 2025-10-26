const API_BASE = import.meta.env.VITE_API_URL || 'https://real-estate-simulator-0rv6.onrender.com/';

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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prop),
  });

  if (!res.ok) {
    const message = await res.text();
    console.error(`Failed to add property (${res.status}):`, message);
    throw new Error(`Backend error: ${res.status}`);
  }

  // Return backend simulation result
  const data = await res.json();
  console.log("Added property with backend metrics:", data);
  return data;
}

export async function listPortfolio() {
  const res = await fetch(`${API_BASE}/portfolio`);
  return res.json();
}

export async function clearPortfolio() {
  const res = await fetch(`${API_BASE}/portfolio`, { method: 'DELETE' });
  return res.json();
}
