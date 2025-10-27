const formatCurrency = (value) => `$${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

export default function PropertyCard({ property }) {
  const irrMonthly = typeof property.irr_monthly === 'number'
    ? property.irr_monthly
    : (typeof property.irr === 'number' ? property.irr : null)
  const irrAnnual = typeof property.irr_annual === 'number'
    ? property.irr_annual
    : (irrMonthly == null ? null : ((1 + irrMonthly) ** 12 - 1))

  const rent = Number(property.monthly_rent ?? 0)
  const totalOut =
    Number(property.monthly_expenses ?? 0) +
    Number(property.taxes_insurance_monthly ?? 0) +
    Number(property.capex_reserve_monthly ?? 0) +
    Number(property.monthly_debt ?? 0)
  const margin = rent <= 0 ? 0 : (rent - totalOut) / Math.max(rent, 1)
  const profitability = Math.max(0, Math.min(1, margin)) * 100

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-500/20">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="h-full w-full bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10" />
      </div>
      <div className="relative z-10 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{property.name || 'Unnamed Property'}</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{property.hold_years} year horizon</p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            {formatCurrency(property.purchase_price)}
          </span>
        </header>

        <dl className="grid grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Monthly rent</dt>
            <dd className="font-mono text-base text-slate-100">{formatCurrency(property.monthly_rent)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Monthly expenses</dt>
            <dd className="font-mono text-base text-slate-100">{formatCurrency(property.monthly_expenses)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Vacancy rate</dt>
            <dd className="font-mono text-base text-slate-100">{((property.vacancy_rate_annual ?? 0) * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Rent growth</dt>
            <dd className="font-mono text-base text-slate-100">{((property.rent_growth_mean ?? 0) * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Annual IRR</dt>
            <dd className="font-mono text-base text-emerald-200">{irrAnnual == null ? '—' : `${(irrAnnual * 100).toFixed(1)}%`}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Monthly debt</dt>
            <dd className="font-mono text-base text-slate-100">{formatCurrency(property.monthly_debt)}</dd>
          </div>
        </dl>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Operating margin</span>
            <span className="font-mono text-emerald-200">{profitability.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-500 transition-all duration-500"
              style={{ width: `${profitability}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
