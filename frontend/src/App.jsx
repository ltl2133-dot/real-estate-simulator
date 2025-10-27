import { useState } from 'react'

import Dashboard from './pages/Dashboard'
import Simulator from './pages/Simulator'

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sim', label: 'Simulator' },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.18),transparent_40%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-400/80">Real Estate Simulator</p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Model cash flow with confidence.</h1>
              <p className="max-w-2xl text-sm text-slate-400">
                Run scenarios, build your portfolio, and stress-test returns without leaving the browser.
              </p>
            </div>
            <nav className="flex gap-2 self-start rounded-full border border-white/10 bg-white/5 p-1 shadow-lg shadow-emerald-500/5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    tab === t.id
                      ? 'bg-emerald-400/90 text-slate-950 shadow-lg shadow-emerald-400/40'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{t.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
          {tab === 'dashboard' ? <Dashboard /> : <Simulator />}
        </main>
      </div>
    </div>
  )
}
