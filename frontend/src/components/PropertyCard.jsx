import { useMemo } from "react";

export default function PropertyCard({ p }) {
  // --- Derived metrics ---
  const irr = useMemo(() => (p.irr ? p.irr * 100 : 8.4), [p]); // fallback IRR
  const irrColor =
    irr > 0
      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      : "bg-rose-500/20 text-rose-600 dark:text-rose-400";

  // Profitability ratio (lower = more expenses)
  const rentExpenseRatio = useMemo(() => {
    const ratio =
      p.monthly_expenses && p.monthly_rent
        ? (p.monthly_expenses / p.monthly_rent) * 100
        : 0;
    return Math.min(Math.max(ratio, 0), 100);
  }, [p]);

  // Derived totals (placeholder until linked to simulation)
  const monthlyCashFlow = useMemo(() => {
    const rent = p.monthly_rent || 0;
    const exp = p.monthly_expenses + p.taxes_insurance_monthly + p.capex_reserve_monthly;
    const estDebt = 1200; // placeholder — replace later with result.monthly_debt if available
    return rent - exp - estDebt;
  }, [p]);

  const totalValue = useMemo(() => {
    const appreciationRate = p.appreciation_mean || 0.03;
    return p.purchase_price * Math.pow(1 + appreciationRate, p.hold_years);
  }, [p]);

  // Label helper for profitability
  const profitLabel =
    rentExpenseRatio < 50
      ? "High Profitability"
      : rentExpenseRatio < 70
      ? "Healthy Profitability"
      : rentExpenseRatio < 90
      ? "Tight Margins"
      : "Negative Margin";

  return (
    <div className="rounded-2xl border border-slate-300/40 bg-gradient-to-br from-white/80 to-slate-50/70 dark:from-slate-800 dark:to-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 backdrop-blur-md p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
          {p.name}
        </h4>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-md ${irrColor}`}
          >
            IRR: {irr.toFixed(1)}%
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
            {p.hold_years}y
          </span>
        </div>
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

      {/* Profitability visualization */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Profitability</span>
          <span>
            {100 - rentExpenseRatio < 0 ? 0 : (100 - rentExpenseRatio).toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-2 bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${100 - rentExpenseRatio}%` }}
          ></div>
        </div>
        <p className="text-xs mt-1 text-slate-500 italic">{profitLabel}</p>
      </div>

      {/* Totals summary */}
      <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Est. Cash Flow:</span>
          <span
            className={`font-mono font-semibold ${
              monthlyCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            ${monthlyCashFlow.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Total Value (10y):</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
