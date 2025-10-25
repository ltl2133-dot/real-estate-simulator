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
  loan: { loan_amount: 245000, interest_rate: 0.065, term_years: 30 }
}

export default function Simulator(){
  const [prop, setProp] = useState(defaultProp)
  const [result, setResult] = useState(null)
  const [portfolioRes, setPortfolioRes] = useState(null)
  const [portfolio, setPortfolio] = useState([])

  useEffect(()=>{ (async()=> setPortfolio(await listPortfolio()))() },[])

  const onRun = async () => {
    const r = await simulateProperty(prop)
    setResult(r)
  }

  const onAdd = async () => {
    await addProperty(prop)
    setPortfolio(await listPortfolio())
  }

  const onRunPortfolio = async () => {
    const payload = { properties: portfolio }
    const r = await simulatePortfolio(payload, 400)
    setPortfolioRes(r)
  }

  const monthlyCF = useMemo(()=>{
    if(!result) return []
    return result.cash_flows.map((v, i)=>({ month: i+1, cashflow: v }))
  },[result])

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h2 className="text-lg font-semibold">Property Inputs</h2>
        <div className="space-y-2 bg-white border rounded-xl p-4">
          {Object.entries(prop).map(([k,v])=>{
            if(typeof v === 'object' && v!==null){
              return (
                <fieldset key={k} className="border rounded-lg p-3 space-y-2">
                  <legend className="text-sm font-medium">Loan</legend>
                  {Object.entries(v).map(([lk,lv])=> (
                    <div key={lk} className="flex items-center justify-between gap-2">
                      <label className="text-sm w-1/2">{lk}</label>
                      <input className="w-1/2 border rounded px-2 py-1" type="number" value={lv}
                        onChange={e=>setProp(p=>({...p, loan:{...p.loan, [lk]: parseFloat(e.target.value)}}))} />
                    </div>
                  ))}
                </fieldset>
              )
            }
            return (
              <div key={k} className="flex items-center justify-between gap-2">
                <label className="text-sm w-1/2">{k}</label>
                <input className="w-1/2 border rounded px-2 py-1" type="number" value={v}
                  onChange={e=>setProp(p=>({...p, [k]: parseFloat(e.target.value)}))} />
              </div>
            )
          })}
          <div className="flex gap-2 pt-2">
            <button onClick={onRun} className="px-3 py-1.5 rounded-lg border">Run Property</button>
            <button onClick={onAdd} className="px-3 py-1.5 rounded-lg border">Add to Portfolio</button>
          </div>
          <div className="pt-2">
            <button onClick={onRunPortfolio} className="px-3 py-1.5 rounded-lg border w-full">Run Portfolio Monte Carlo</button>
          </div>
        </div>
        <StressTestPanel />
      </div>
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white border rounded-xl p-4">
          <h3 className="font-medium mb-2">Property Simulation Result</h3>
          {!result && <p className="text-sm text-slate-600">Run a simulation to see outputs.</p>}
          {result && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-2 text-sm">
                <div>Monthly Debt: <span className="font-mono">${'{'}result.monthly_debt.toFixed(2){'}'}</span></div>
                <div>Estimated IRR: <span className="font-mono">{'${'}(result.irr*100).toFixed(2){'}'}%</span></div>
                <div>Horizon: <span className="font-mono">{'${'}(prop.hold_years*12){'}'} months</span></div>
              </div>
              <SimulationChart data={monthlyCF} dataKey="cashflow" label="Monthly Cash Flow" />
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h3 className="font-medium mb-2">Portfolio Monte Carlo</h3>
          {!portfolioRes && <p className="text-sm text-slate-600">Add properties and run portfolio simulation.</p>}
          {portfolioRes && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">Showing expected monthly CF with 10th–90th percentile band.</p>
              <SimulationChart data={portfolioRes.expected_monthly_cf.map((v,i)=>({
                month: i+1,
                expected: v,
                p10: portfolioRes.p10_cf[i],
                p90: portfolioRes.p90_cf[i]
              }))} dataKey="expected" label="Expected Monthly CF" p10Key="p10" p90Key="p90" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
