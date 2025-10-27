export default function PropertyCard({ p }) {
  const irrMonthly = typeof p.irr_monthly === "number" ? p.irr_monthly
                    : (typeof p.irr === "number" ? p.irr : null);
  const irrAnnual = typeof p.irr_annual === "number"
    ? p.irr_annual
    : (irrMonthly == null ? null : ((1 + irrMonthly) ** 12 - 1));

  const profitPct = (() => {
    const rent = p.monthly_rent || 0;
    const totalOut = (p.monthly_expenses || 0) + (p.taxes_insurance_monthly || 0) + (p.capex_reserve_monthly || 0) + (p.monthly_debt || 0);
    if (rent <= 0) return 0;
    const margin = (rent - totalOut) / rent;
    return Math.max(0, Math.min(1, margin)) * 100;
  })();

  return (
    <div className="border rounded-2xl bg-white/70 backdrop-blur p-4 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{p.name}</h4>
        <span className="text-xs text-slate-500">{p.hold_years}y</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div>Rent: <span className="font-mono">${p.monthly_rent}</span></div>
        <div>Expenses: <span className="font-mono">${p.monthly_expenses}</span></div>
        <div>Vacancy (ann): <span className="font-mono">{(p.vacancy_rate_annual * 100).toFixed(1)}%</span></div>
        <div>Growth (rent): <span className="font-mono">{(p.rent_growth_mean * 100).toFixed(1)}%</span></div>
        <div>IRR (annual): <span className="font-mono">{irrAnnual == null ? "—" : (irrAnnual * 100).toFixed(1) + "%"}</span></div>
        <div>Profitability: <span className="font-mono">{profitPct.toFixed(1)}%</span></div>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
        <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${profitPct}%` }} />
      </div>
    </div>
  )
}