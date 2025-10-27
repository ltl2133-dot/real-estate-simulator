import { useEffect, useMemo, useState } from 'react'
import { simulateProperty, simulatePortfolio, addProperty, listPortfolio } from '../utils/api'
import SimulationChart from '../components/SimulationChart'
import StressTestPanel from '../components/StressTestPanel'

const defaultProp = {
  name: 'Phoenix Duplex',
  purchase_price: 350000,
  monthly_rent: 3200,
  monthly_expenses: 900,
  taxes_insurance_monthly: 300,
  capex_reserve_monthly: 150,
  rent_growth_mean: 0.03,
  rent_growth_std: 0.01,
  expense_growth_mean: 0.02,
  expense_growth_std: 0.01,
  vacancy_rate_annual: 0.06,
  vacancy_volatility: 0.02,
  appreciation_mean: 0.025,
  appreciation_std: 0.03,
  maintenance_shock_lambda: 0.15,
  maintenance_shock_avg_cost: 1200,
  hold_years: 10,
  loan: { loan_amount: 245000, interest_rate: 0.065, term_years: 30, amortization_years: 30 }
}

const NUM_KEYS = new Set([
  "purchase_price","monthly_rent","monthly_expenses","taxes_insurance_monthly","capex_reserve_monthly",
  "rent_growth_mean","rent_growth_std","expense_growth_mean","expense_growth_std","vacancy_rate_annual",
  "vacancy_volatility","appreciation_mean","appreciation_std","maintenance_shock_lambda","maintenance_shock_avg_cost","hold_years"
]);
const toNum = (v) => {
  const n = parseFloat(v); return Number.isFinite(n) ? n : 0;
};

export default function Simulator() {
  const [prop, setProp] = useState(defaultProp)
  const [result, setResult] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [portfolioRes, setPortfolioRes] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { (async () => setPortfolio(await listPortfolio()))() }, [])

  const onRun = async () => {
    setBusy(true)
    try { setResult(await simulateProperty(prop)) }
    finally { setBusy(false) }
  }

  const onAdd = async () => {
    setBusy(true)
    try {
      const added = await addProperty(prop)
      setPortfolio(prev => [...prev, added])
    } finally { setBusy(false) }
  }

  const onRunPortfolio = async () => {
    if (portfolio.length === 0) return
    setBusy(true)
    try {
      const payload = { properties: portfolio }
      const r = await simulatePortfolio(payload, 400)
      setPortfolioRes(r)
    } finally { setBusy(false) }
  }

  const monthlyCF = useMemo(
    () => result ? result.cash_flows.map((v, i) => ({ month: i + 1, cashflow: v })) : [],
    [result]
  )

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h2 className="text-lg font-semibold">Property Inputs</h2>

        <div className={`space-y-2 border rounded-xl p-4 bg-white/70 backdrop-blur transition-all ${busy ? 'opacity-70' : 'opacity-100'}`}>
          {Object.entries(prop).map(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
              return (
                <fieldset key={k} className="border rounded-lg p-3 space-y-2">
                  <legend className="text-sm font-medium">Loan</legend>
                  {Object.entries(v).map(([lk, lv]) => (
                    <div key={lk} className="flex items-center justify-between gap-2">
                      <label className="text-sm w-1/2">{lk}</label>
                      <input
                        className="w-1/2 border rounded-lg px-2 py-1 text-white bg-gray-900 placeholder-gray-400 transition focus:ring-2 focus:ring-emerald-400"
                        type="text" value={lv}
                        onChange={e => setProp(p => ({ ...p, loan: { ...p.loan, [lk]: toNum(e.target.value) } }))}
                      />
                    </div>
                  ))}
                </fieldset>
              )
            }
            return (
              <div key={k} className="flex items-center justify-between gap-2">
                <label className="text-sm w-1/2">{k}</label>
                <input
                  className="w-1/2 border rounded-lg px-2 py-1 text-white bg-gray-900 placeholder-gray-400 transition focus:ring-2 focus:ring-emerald-400"
                  type="text" value={v}
                  onChange={e => setProp(p => ({ ...p, [k]: NUM_KEYS.has(k) ? toNum(e.target.value) : e.target.value }))}
                />
              </div>
            )
          })}
          <div className="flex gap-2 pt-2">
            <button onClick={onRun} className="px-3 py-1.5 rounded-lg border hover:shadow">
              {busy ? 'Running…' : 'Run Property'}
            </button>
            <button onClick={onAdd} className="px-3 py-1.5 rounded-lg border hover:shadow">
              {busy ? 'Adding…' : 'Add to Portfolio'}
            </button>
          </div>
          <div className="pt-2">
            <button onClick={onRunPortfolio} className="px-3 py-1.5 rounded-lg border w-full hover:shadow">
              {busy ? 'Simulating…' : 'Run Portfolio Monte Carlo'}
            </button>
          </div>
        </div>

        <StressTestPanel />
      </div>

      <div className="md:col-span-2 space-y-6">
        <div className="border rounded-xl p-4 bg-white/70 backdrop-blur">
          <h3 className="font-medium mb-2">Property Simulation Result</h3>
          {!result && <p className="text-sm text-slate-600">Run a simulation to see outputs.</p>}
          {result && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-2 text-sm">
                <div>Monthly Debt: <span className="font-mono">${result.monthly_debt.toFixed(2)}</span></div>
                <div>Estimated IRR: <span className="font-mono">{(result.irr_annual * 100).toFixed(2)}%</span></div>
                <div>Horizon: <span className="font-mono">{prop.hold_years * 12} months</span></div>
              </div>
              <SimulationChart data={monthlyCF} dataKey="cashflow" label="Monthly Cash Flow" />
            </div>
          )}
        </div>

        <div className="border rounded-xl p-4 bg-white/70 backdrop-blur">
          <h3 className="font-medium mb-2">Portfolio Monte Carlo</h3>
          {!portfolioRes && <p className="text-sm text-slate-600">Add properties and run portfolio simulation.</p>}
          {portfolioRes && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">Expected monthly CF with 10th–90th percentile band.</p>
              <SimulationChart
                data={portfolioRes.expected_monthly_cf.map((v, i) => ({
                  month: i + 1, expected: v, p10: portfolioRes.p10_cf[i], p90: portfolioRes.p90_cf[i]
                }))}
                dataKey="expected"
                label="Expected Monthly CF"
                p10Key="p10"
                p90Key="p90"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}