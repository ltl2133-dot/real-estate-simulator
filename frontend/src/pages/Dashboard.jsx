import { useEffect, useState } from 'react'

import PropertyCard from '../components/PropertyCard'
import { clearPortfolio, listPortfolio } from '../utils/api'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await listPortfolio()
      setItems(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Portfolio overview</h2>
          <p className="text-sm text-slate-400">
            Everything you have modelled streams in live. Add properties from the simulator to visualise performance.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await clearPortfolio()
            await refresh()
          }}
          disabled={!items.length}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-emerald-400 enabled:hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
        >
          Clear portfolio
        </button>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((property, idx) => (
          <PropertyCard key={`${property.name}-${idx}`} property={property} />
        ))}
      </div>

      {!loading && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-8 text-sm text-slate-400">
          Your dashboard is waiting. Model a property in the simulator and add it to the portfolio to see it here.
        </p>
      )}

      {loading && (
        <p className="text-sm text-slate-400">Loading portfolio…</p>
      )}
    </section>
  )
}
