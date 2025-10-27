import { useCallback, useEffect, useMemo, useState } from 'react'

import SimulationChart from '../components/SimulationChart'
import StressTestPanel from '../components/StressTestPanel'
import {
  addProperty,
  listPortfolio,
  simulatePortfolio,
  simulateProperty,
} from '../utils/api'

const DEFAULT_PROPERTY = {
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
  loan: { loan_amount: 245000, interest_rate: 0.065, term_years: 30, amortization_years: 30 },
}

const PROPERTY_FIELDS = [
  { key: 'name', label: 'Name', numeric: false },
  { key: 'purchase_price', label: 'Purchase price', numeric: true },
  { key: 'monthly_rent', label: 'Monthly rent', numeric: true },
  { key: 'monthly_expenses', label: 'Monthly expenses', numeric: true },
  { key: 'taxes_insurance_monthly', label: 'Taxes & insurance', numeric: true },
  { key: 'capex_reserve_monthly', label: 'CapEx reserve', numeric: true },
  { key: 'rent_growth_mean', label: 'Rent growth (mean)', numeric: true },
  { key: 'rent_growth_std', label: 'Rent growth (std)', numeric: true },
  { key: 'expense_growth_mean', label: 'Expense growth (mean)', numeric: true },
  { key: 'expense_growth_std', label: 'Expense growth (std)', numeric: true },
  { key: 'vacancy_rate_annual', label: 'Vacancy rate', numeric: true },
  { key: 'vacancy_volatility', label: 'Vacancy volatility', numeric: true },
  { key: 'appreciation_mean', label: 'Appreciation (mean)', numeric: true },
  { key: 'appreciation_std', label: 'Appreciation (std)', numeric: true },
  { key: 'maintenance_shock_lambda', label: 'Maintenance shock λ', numeric: true },
  { key: 'maintenance_shock_avg_cost', label: 'Maintenance avg cost', numeric: true },
  { key: 'hold_years', label: 'Hold (years)', numeric: true, integer: true, min: 1 },
]

const LOAN_FIELDS = [
  { key: 'loan_amount', label: 'Loan amount', numeric: true },
  { key: 'interest_rate', label: 'Interest rate (decimal or %)', numeric: true },
  { key: 'term_years', label: 'Term (years)', numeric: true, integer: true, min: 1 },
  { key: 'amortization_years', label: 'Amortization (years)', numeric: true, integer: true, min: 1 },
]

const toNumber = (value) => {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : 0
}

const parseFieldValue = (field, rawValue) => {
  if (!field.numeric) return rawValue
  const numeric = toNumber(rawValue)
  if (field.integer) {
    const rounded = Math.round(numeric)
    const min = field.min ?? 0
    return Number.isFinite(rounded) ? Math.max(rounded, min) : min
  }
  return numeric
}

export default function Simulator() {
  const [prop, setProp] = useState(DEFAULT_PROPERTY)
  const [result, setResult] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [portfolioRes, setPortfolioRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  const loadPortfolio = useCallback(async () => {
    const data = await listPortfolio()
    const formatted = Array.isArray(data) ? data : []
    setPortfolio(formatted)
    return formatted
  }, [])

  useEffect(() => {
    loadPortfolio()
  }, [loadPortfolio])

  const monthlyCF = useMemo(
    () => (result ? result.cash_flows.map((v, i) => ({ month: i + 1, cashflow: v })) : []),
    [result],
  )

  const handleRunProperty = async () => {
    setBusy(true)
    setStatus('Running property simulation…')
    try {
      const data = await simulateProperty(prop)
      setResult(data)
      setStatus('Property simulation complete.')
    } catch (error) {
      console.error(error)
      setStatus(error.message || 'Unable to run property simulation.')
    } finally {
      setBusy(false)
    }
  }

  const handleAddToPortfolio = async () => {
    setBusy(true)
    setStatus('Saving property to portfolio…')
    try {
      await addProperty(prop)
      await loadPortfolio()
      setStatus('Property added to portfolio.')
    } catch (error) {
      console.error(error)
      setStatus(error.message || 'Unable to add property.')
    } finally {
      setBusy(false)
    }
  }

  const handleRunMonteCarlo = async () => {
    const snapshot = portfolio.length ? portfolio : await loadPortfolio()
    if (!snapshot.length) {
      setStatus('Add at least one property to run Monte Carlo simulations.')
      return
    }

    setBusy(true)
    setStatus('Running Monte Carlo portfolio simulation…')
    try {
      const data = await simulatePortfolio({ properties: snapshot }, 400)
      setPortfolioRes(data)
      setStatus('Monte Carlo simulation complete.')
    } catch (error) {
      console.error(error)
      setStatus(error.message || 'Unable to run Monte Carlo simulation.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] xl:grid-cols-[minmax(0,420px)_1fr]">
      <aside className="space-y-6">
        <div className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-emerald-500/5 transition ${busy ? 'opacity-80' : 'opacity-100'}`}>
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Property inputs</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Configure a scenario</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {portfolio.length} in portfolio
            </span>
          </header>

          <div className="grid gap-3">
            {PROPERTY_FIELDS.map((field) => (
              <label key={field.key} className="space-y-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">{field.label}</span>
                <input
                  type="text"
                  inputMode={field.numeric ? 'decimal' : 'text'}
                  value={prop[field.key] ?? ''}
                  onChange={(event) => {
                    const value = parseFieldValue(field, event.target.value)
                    setProp((previous) => ({ ...previous, [field.key]: value }))
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none"
                />
              </label>
            ))}
          </div>

          <fieldset className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Loan</legend>
            {LOAN_FIELDS.map((field) => (
              <label key={field.key} className="space-y-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">{field.label}</span>
                <input
                  type="text"
                  inputMode={field.numeric ? 'decimal' : 'text'}
                  value={prop.loan?.[field.key] ?? ''}
                  onChange={(event) => {
                    const value = parseFieldValue(field, event.target.value)
                    setProp((previous) => ({
                      ...previous,
                      loan: { ...(previous.loan ?? {}), [field.key]: value },
                    }))
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none"
                />
              </label>
            ))}
          </fieldset>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRunProperty}
              disabled={busy}
              className="flex-1 rounded-full border border-emerald-400/60 bg-emerald-400/20 px-4 py-2 text-sm font-medium text-emerald-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
            >
              {busy ? 'Working…' : 'Run Property'}
            </button>
            <button
              type="button"
              onClick={handleAddToPortfolio}
              disabled={busy}
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
            >
              {busy ? 'Saving…' : 'Add to Portfolio'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleRunMonteCarlo}
            disabled={busy}
            className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:text-sky-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-500"
          >
            {busy ? 'Simulating…' : 'Run Monte Carlo'}
          </button>
        </div>

        <StressTestPanel />

        {status && (
          <p className="text-xs text-slate-400">{status}</p>
        )}
      </aside>

      <section className="space-y-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-emerald-500/5">
          <h3 className="text-lg font-semibold tracking-tight text-white">Property simulation result</h3>
          {!result && (
            <p className="mt-2 text-sm text-slate-400">Run a property simulation to see projected monthly cash flow and IRR.</p>
          )}
          {result && (
            <div className="mt-4 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Monthly debt</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-200">${result.monthly_debt.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Annual IRR</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-200">{(result.irr_annual * 100).toFixed(2)}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Horizon</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-200">{prop.hold_years * 12} months</p>
                </div>
              </div>
              <SimulationChart data={monthlyCF} dataKey="cashflow" label="Monthly cash flow" />
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/5">
          <h3 className="text-lg font-semibold tracking-tight text-white">Portfolio Monte Carlo</h3>
          {!portfolioRes && (
            <p className="mt-2 text-sm text-slate-400">Add properties to your portfolio and run Monte Carlo to visualise uncertainty bands.</p>
          )}
          {portfolioRes && (
            <div className="mt-4 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Horizon</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-200">{portfolioRes.horizon_months} months</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">P10 cash flow (month 12)</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-200">${portfolioRes.p10_cf[11]?.toFixed(2) ?? '0.00'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">P90 cash flow (month 12)</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-200">${portfolioRes.p90_cf[11]?.toFixed(2) ?? '0.00'}</p>
                </div>
              </div>
              <SimulationChart
                data={portfolioRes.expected_monthly_cf.map((value, index) => ({
                  month: index + 1,
                  expected: value,
                  p10: portfolioRes.p10_cf[index],
                  p90: portfolioRes.p90_cf[index],
                }))}
                dataKey="expected"
                label="Expected monthly cash flow"
                p10Key="p10"
                p90Key="p90"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
