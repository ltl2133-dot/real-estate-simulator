# backend/models/simulation.py
from typing import Dict, Any
import numpy as np
from models.property import PropertyInput
from utils.finance import monthly_payment, irr, annualize
from utils.random_events import monthly_vacancy_loss, maintenance_shock, growth_step

def simulate_property_monthly(prop: PropertyInput, seed: int | None = None) -> Dict[str, Any]:
    rng = np.random.default_rng(seed)
    months = int(prop.hold_years * 12)

    rent = prop.monthly_rent
    opex = prop.monthly_expenses + prop.taxes_insurance_monthly + prop.capex_reserve_monthly

    monthly_debt = 0.0
    if prop.loan:
        monthly_debt = monthly_payment(
            prop.loan.loan_amount,
            prop.loan.interest_rate,
            prop.loan.term_years,
            prop.loan.amortization_years or prop.loan.term_years,
        )

    month_cf, month_income, month_expenses, month_vacancy, month_maint = [], [], [], [], []

    for _ in range(months):
        vac_loss = monthly_vacancy_loss(rng, rent, prop.vacancy_rate_annual, prop.vacancy_volatility)
        maint = maintenance_shock(rng, prop.maintenance_shock_lambda, prop.maintenance_shock_avg_cost)

        income = rent - vac_loss
        expenses = opex + maint
        noi = income - expenses
        cf = noi - monthly_debt

        month_income.append(float(income))
        month_expenses.append(float(expenses))
        month_vacancy.append(float(vac_loss))
        month_maint.append(float(maint))
        month_cf.append(float(cf))

        rent = growth_step(rng, rent, prop.rent_growth_mean, prop.rent_growth_std)
        opex = growth_step(rng, opex, prop.expense_growth_mean, prop.expense_growth_std)

    # Put sale at end-of-horizon in the LAST month (keeps array length = months)
    sale_value = prop.purchase_price * ((1 + prop.appreciation_mean) ** prop.hold_years)
    if month_cf:
        month_cf[-1] += float(sale_value)

    cash_flows = [-float(prop.purchase_price)] + month_cf
    irr_monthly = irr(cash_flows)
    irr_annual = annualize(irr_monthly) if irr_monthly is not None else 0.0

    return {
        "cash_flows": month_cf,           # length = months
        "income": month_income,
        "expenses": month_expenses,
        "vacancy_losses": month_vacancy,
        "maintenance": month_maint,
        "monthly_debt": monthly_debt,
        "irr_monthly": irr_monthly,
        "irr_annual": irr_annual,         # convenience so UI doesn’t double-convert
        "total_value": sale_value,
    }

def simulate_portfolio(props: list[PropertyInput], simulations: int = 500, seed: int | None = None) -> Dict[str, Any]:
    if not props:
        return {"error": "No properties provided"}

    rng = np.random.default_rng(seed)
    months = int(max(p.hold_years for p in props) * 12)
    sim_cf = np.zeros((simulations, months))

    # Monte Carlo
    for s in range(simulations):
        total_cf = np.zeros(months)
        # independent seeds per property per run
        for i, p in enumerate(props):
            res = simulate_property_monthly(p, seed=int(rng.integers(0, 2**31 - 1)))
            cf = np.array(res["cash_flows"], dtype=float)
            if len(cf) < months:
                cf = np.pad(cf, (0, months - len(cf)), constant_values=0.0)
            total_cf += cf
        sim_cf[s, :] = total_cf

    exp_cf = sim_cf.mean(axis=0)
    p10 = np.percentile(sim_cf, 10, axis=0)
    p90 = np.percentile(sim_cf, 90, axis=0)

    return {
        "expected_monthly_cf": exp_cf.tolist(),
        "p10_cf": p10.tolist(),
        "p90_cf": p90.tolist(),
        "horizon_months": months,
    }