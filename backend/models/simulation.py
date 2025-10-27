from typing import Dict, Any
import numpy as np
from models.property import PropertyInput
from utils.finance import monthly_payment, irr, annualize
from utils.random_events import monthly_vacancy_loss, maintenance_shock, growth_step

def simulate_property_monthly(prop: PropertyInput, seed: int | None = None) -> Dict[str, Any]:
    rng = np.random.default_rng(seed)
    months = int(prop.hold_years * 12)

    rent = float(prop.monthly_rent)
    opex = float(prop.monthly_expenses + prop.taxes_insurance_monthly + prop.capex_reserve_monthly)

    monthly_debt = 0.0
    if prop.loan:
        monthly_debt = monthly_payment(
            prop.loan.loan_amount,
            prop.loan.interest_rate,
            prop.loan.term_years,
            prop.loan.amortization_years or prop.loan.term_years,
        )

    cf_list, inc_list, exp_list, vac_list, maint_list = [], [], [], [], []

    for _ in range(months):
        vac = monthly_vacancy_loss(rng, rent, prop.vacancy_rate_annual, prop.vacancy_volatility)
        maint = maintenance_shock(rng, prop.maintenance_shock_lambda, prop.maintenance_shock_avg_cost)

        income = rent - vac
        expenses = opex + maint
        noi = income - expenses
        cf = noi - monthly_debt

        inc_list.append(float(income))
        exp_list.append(float(expenses))
        vac_list.append(float(vac))
        maint_list.append(float(maint))
        cf_list.append(float(cf))

        rent = growth_step(rng, rent, prop.rent_growth_mean, prop.rent_growth_std)
        opex = growth_step(rng, opex, prop.expense_growth_mean, prop.expense_growth_std)

    # Sale at end of horizon (included in last month's CF)
    sale_value = float(prop.purchase_price * ((1.0 + prop.appreciation_mean) ** prop.hold_years))
    if cf_list:
        cf_list[-1] += sale_value

    flows = [-float(prop.purchase_price)] + cf_list
    irr_m = irr(flows)
    irr_y = annualize(irr_m)

    return {
        "cash_flows": cf_list,
        "income": inc_list,
        "expenses": exp_list,
        "vacancy_losses": vac_list,
        "maintenance": maint_list,
        "monthly_debt": monthly_debt,
        "irr_monthly": irr_m,
        "irr_annual": irr_y,
        "total_value": sale_value,
    }

def simulate_portfolio(props: list[PropertyInput], simulations: int = 500, seed: int | None = None) -> Dict[str, Any]:
    if not props:
        return {"error": "No properties provided"}

    rng = np.random.default_rng(seed)
    months = int(max(p.hold_years for p in props) * 12)
    sim_cf = np.zeros((simulations, months), dtype=float)

    for s in range(simulations):
        total = np.zeros(months, dtype=float)
        for p in props:
            res = simulate_property_monthly(p, seed=int(rng.integers(0, 2**31 - 1)))
            cf = np.array(res["cash_flows"], dtype=float)
            if len(cf) < months:
                cf = np.pad(cf, (0, months - len(cf)), constant_values=0.0)
            total += cf
        sim_cf[s, :] = total

    exp = sim_cf.mean(axis=0)
    p10 = np.percentile(sim_cf, 10, axis=0)
    p90 = np.percentile(sim_cf, 90, axis=0)

    return {
        "expected_monthly_cf": exp.tolist(),
        "p10_cf": p10.tolist(),
        "p90_cf": p90.tolist(),
        "horizon_months": months,
    }