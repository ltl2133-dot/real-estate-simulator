export default function PropertyCard({ p }) {
  return (
    <div className="border rounded-xl bg-white p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{p.name}</h4>
        <span className="text-xs text-slate-500">{p.hold_years}y</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div>
          Rent: <span className="font-mono">${p.monthly_rent}</span>
        </div>
        <div>
          Expenses: <span className="font-mono">${p.monthly_expenses}</span>
        </div>
        <div>
          Vacancy (ann):{" "}
          <span className="font-mono">
            {(p.vacancy_rate_annual * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          Growth (rent):{" "}
          <span className="font-mono">
            {(p.rent_growth_mean * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
