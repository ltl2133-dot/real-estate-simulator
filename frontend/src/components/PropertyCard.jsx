export default function PropertyCard({ p }) {
  return (
    <div className="rounded-2xl border border-slate-300/40 bg-gradient-to-br from-white/80 to-slate-50/70 dark:from-slate-800 dark:to-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 backdrop-blur-md p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
          {p.name}
        </h4>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
          {p.hold_years}y
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[0.9rem] text-slate-700 dark:text-slate-300">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Rent:</span>{" "}
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
            ${p.monthly_rent.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-slate-500 dark:text-slate-400">Expenses:</span>{" "}
          <span className="font-mono font-semibold text-rose-500">
            ${p.monthly_expenses.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-slate-500 dark:text-slate-400">
            Vacancy (ann):
          </span>{" "}
          <span className="font-mono font-semibold">
            {(p.vacancy_rate_annual * 100).toFixed(1)}%
          </span>
        </div>

        <div>
          <span className="text-slate-500 dark:text-slate-400">Growth (rent):</span>{" "}
          <span className="font-mono font-semibold text-emerald-500">
            {(p.rent_growth_mean * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
