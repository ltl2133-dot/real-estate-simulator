from typing import Dict, Any
import numpy as np
from models.property import PropertyInput
from utils.finance import monthly_payment, irr
from utils.random_events import (
    monthly_vacancy_loss,
    maintenance_shock,
    growth_step,
)

def simulate_property_monthly(prop: PropertyInput, seed: int | None = None) -> Dict[str, Any]:
    if seed is not None:
        np.random.seed(seed)

    months = prop.hold_years * 12

    # Initial state
    rent = prop.monthly_rent
    opex = prop.monthly_expenses + prop.taxes_insurance_monthly + prop.capex_reserve_monthly

    # Debt service
    monthly_debt = 0.0
    if prop.loan:
        monthly_debt = monthly_payment(
            prop.loan.loan_amount,
            prop.loan.interest_rate,
            prop.loan.term_years,
        )

    # Trackers
    month_cf = []
    month_income = []
    month_expenses = []
    month_vacancy = []
    month_maint = []

    for _ in range(months):
        # Vacancy loss
        vac_loss = monthly_vacancy_loss(
            rent, prop.vacancy_rate_annual, prop.vacancy_volatility
        )
        # Maintenance shocks
        maint = maintenance_shock(
            prop.maintenance_shock_lambda, prop.maintenance_shock_avg_cost
        )

        # Net operating income before debt
        income = rent - vac_loss
        expenses = opex + maint
        noi = income - expenses
        cf = noi - monthly_debt

        month_income.append(float(income))
        month_expenses.append(float(expenses))
        month_vacancy.append(float(vac_loss))
        month_maint.append(float(maint))
        month_cf.append(float(cf))

        # Evolve rent and expenses
        rent = growth_step(rent, prop.rent_growth_mean, prop.rent_growth_std)
        opex = growth_step(opex, prop.expense_growth_mean, prop.expense_growth_std)

    # --- Investment Cash Flows & IRR ---
    # Outflow = purchase price; inflows = monthly CFs; final inflow = sale value
    sale_value = prop.purchase_price * ((1 + prop.appreciation_mean) ** prop.hold_years)
    cash_flows = [-prop.purchase_price] + month_cf + [sale_value]

    portfolio_irr = irr(cash_flows, guess=0.08)
    if not np.isfinite(portfolio_irr):
        portfolio_irr = 0.0

    # --- Derived Metrics ---
    final_value = sale_value
    total_net_cashflow = sum(month_cf) + final_value - prop.purchase_price

    return {
        "cash_flows": month_cf,
        "income": month_income,
        "expenses": month_expenses,
        "vacancy_losses": month_vacancy,
        "maintenance": month_maint,
        "monthly_debt": monthly_debt,
        "irr": portfolio_irr,
        "total_value": final_value,
        "total_net_cashflow": total_net_cashflow,
    }


def simulate_portfolio(props: list[PropertyInput], simulations: int = 500) -> Dict[str, Any]:
    # Monte Carlo runs — aggregate per-month CF distributions
    if not props:
        return {"error": "No properties provided"}

    months = props[0].hold_years * 12
    sim_cf = np.zeros((simulations, months))

    for s in range(simulations):
        total_cf = np.zeros(months)
        for p in props:
            res = simulate_property_monthly(p)
            total_cf += np.array(res["cash_flows"])  # type: ignore
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
