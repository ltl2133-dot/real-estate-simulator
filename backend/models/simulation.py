from __future__ import annotations

from math import isfinite
from typing import Any, Dict, List, Optional

import numpy as np
from pydantic import BaseModel, Field

from models.property import PropertyInput
from utils.finance import annualize, irr, monthly_payment
from utils.random_events import growth_step, maintenance_shock, monthly_vacancy_loss


class SimulationResult(BaseModel):
    cash_flows: List[float] = Field(default_factory=list)
    income: List[float] = Field(default_factory=list)
    expenses: List[float] = Field(default_factory=list)
    vacancy_losses: List[float] = Field(default_factory=list)
    maintenance: List[float] = Field(default_factory=list)
    monthly_debt: float = 0.0
    irr_monthly: float = 0.0
    irr_annual: float = 0.0
    total_value: float = 0.0


class PortfolioSimulationResult(BaseModel):
    expected_monthly_cf: List[float]
    p10_cf: List[float]
    p90_cf: List[float]
    horizon_months: int


def _safe_float(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def simulate_property_monthly(prop: PropertyInput, seed: Optional[int] = None) -> Dict[str, Any]:
    rng = np.random.default_rng(seed)
    months = int(max(prop.hold_years, 1) * 12)

    rent = float(prop.monthly_rent)
    opex = float(prop.monthly_expenses + prop.taxes_insurance_monthly + prop.capex_reserve_monthly)

    monthly_debt = 0.0
    if prop.loan and prop.loan.loan_amount > 0:
        amortization = prop.loan.amortization_years or prop.loan.term_years
        monthly_debt = monthly_payment(
            float(prop.loan.loan_amount),
            float(prop.loan.interest_rate),
            int(prop.loan.term_years),
            int(amortization),
        )

    cf_list: List[float] = []
    inc_list: List[float] = []
    exp_list: List[float] = []
    vac_list: List[float] = []
    maint_list: List[float] = []

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

    purchase_price = _safe_float(prop.purchase_price)
    sale_value = float(prop.purchase_price or 0.0)
    if prop.appreciation_mean or prop.hold_years:
        sale_value = float(purchase_price * ((1.0 + float(prop.appreciation_mean)) ** float(prop.hold_years)))

    if cf_list:
        cf_list[-1] += sale_value

    flows = [-purchase_price] + cf_list
    irr_m = irr(flows)
    if not isfinite(irr_m):
        irr_m = 0.0
    irr_y = annualize(irr_m) if isfinite(irr_m) else 0.0
    if not isfinite(irr_y):
        irr_y = 0.0

    return {
        "cash_flows": [float(v) for v in cf_list],
        "income": inc_list,
        "expenses": exp_list,
        "vacancy_losses": vac_list,
        "maintenance": maint_list,
        "monthly_debt": float(monthly_debt),
        "irr_monthly": float(irr_m),
        "irr_annual": float(irr_y),
        "total_value": float(sale_value),
    }


def simulate_portfolio(
    props: List[PropertyInput],
    simulations: int = 500,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    if not props:
        return {
            "expected_monthly_cf": [],
            "p10_cf": [],
            "p90_cf": [],
            "horizon_months": 0,
        }

    rng = np.random.default_rng(seed)
    months = int(max(p.hold_years for p in props) * 12)
    if months <= 0:
        return {
            "expected_monthly_cf": [],
            "p10_cf": [],
            "p90_cf": [],
            "horizon_months": 0,
        }

    sim_cf = np.zeros((simulations, months), dtype=float)

    for s in range(simulations):
        total = np.zeros(months, dtype=float)
        for p in props:
            child_seed = int(rng.integers(0, 2**31 - 1))
            res = simulate_property_monthly(p, seed=child_seed)
            cf = np.array(res["cash_flows"], dtype=float)
            if len(cf) < months:
                cf = np.pad(cf, (0, months - len(cf)), constant_values=0.0)
            total += cf
        sim_cf[s, :] = total

    expected = sim_cf.mean(axis=0)
    p10 = np.percentile(sim_cf, 10, axis=0)
    p90 = np.percentile(sim_cf, 90, axis=0)

    return {
        "expected_monthly_cf": expected.tolist(),
        "p10_cf": p10.tolist(),
        "p90_cf": p90.tolist(),
        "horizon_months": months,
    }
