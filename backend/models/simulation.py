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
    """Run a single Monte Carlo simulation for a property on a monthly basis."""

    rng = np.random.default_rng(seed)
    months = int(max(prop.hold_years, 1) * 12)

    rent = float(prop.monthly_rent)
    opex = float(
        prop.monthly_expenses
        + prop.taxes_insurance_monthly
        + prop.capex_reserve_monthly
    )

    monthly_debt = 0.0
    if prop.loan and prop.loan.loan_amount > 0:
        amortization = prop.loan.amortization_years or prop.loan.term_years
        monthly_debt = monthly_payment(
            float(prop.loan.loan_amount),
            float(prop.loan.interest_rate),
            int(prop.loan.term_years),
            int(amortization),
        )

    cash_flows: List[float] = []
    income_series: List[float] = []
    expense_series: List[float] = []
    vacancy_losses: List[float] = []
    maintenance_series: List[float] = []

    for _ in range(months):
        vacancy = monthly_vacancy_loss(
            rng,
            rent,
            prop.vacancy_rate_annual,
            prop.vacancy_volatility,
        )
        maintenance = maintenance_shock(
            rng,
            prop.maintenance_shock_lambda,
            prop.maintenance_shock_avg_cost,
        )

        income = rent - vacancy
        expenses = opex + maintenance
        noi = income - expenses
        cash_flow = noi - monthly_debt

        income_series.append(float(income))
        expense_series.append(float(expenses))
        vacancy_losses.append(float(vacancy))
        maintenance_series.append(float(maintenance))
        cash_flows.append(float(cash_flow))

        rent = growth_step(rng, rent, prop.rent_growth_mean, prop.rent_growth_std)
        opex = growth_step(rng, opex, prop.expense_growth_mean, prop.expense_growth_std)

    purchase_price = _safe_float(prop.purchase_price)
    sale_value = float(prop.purchase_price or 0.0)
    if prop.appreciation_mean or prop.hold_years:
        sale_value = float(
            purchase_price
            * ((1.0 + float(prop.appreciation_mean)) ** float(prop.hold_years))
        )

    if cash_flows:
        cash_flows[-1] += sale_value

    flows = [-purchase_price] + cash_flows
    irr_monthly = irr(flows)
    if not isfinite(irr_monthly):
        irr_monthly = 0.0

    irr_annual = annualize(irr_monthly) if isfinite(irr_monthly) else 0.0
    if not isfinite(irr_annual):
        irr_annual = 0.0

    result = SimulationResult(
        cash_flows=[float(value) for value in cash_flows],
        income=income_series,
        expenses=expense_series,
        vacancy_losses=vacancy_losses,
        maintenance=maintenance_series,
        monthly_debt=float(monthly_debt),
        irr_monthly=float(irr_monthly),
        irr_annual=float(irr_annual),
        total_value=float(sale_value),
    )

    return result.model_dump()


def simulate_portfolio(
    props: List[PropertyInput],
    simulations: int = 500,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    if not props:
        return PortfolioSimulationResult(
            expected_monthly_cf=[],
            p10_cf=[],
            p90_cf=[],
            horizon_months=0,
        ).model_dump()

    rng = np.random.default_rng(seed)
    months = int(max(p.hold_years for p in props) * 12)
    if months <= 0:
        return PortfolioSimulationResult(
            expected_monthly_cf=[],
            p10_cf=[],
            p90_cf=[],
            horizon_months=0,
        ).model_dump()

    sim_cf = np.zeros((simulations, months), dtype=float)

    for index in range(simulations):
        total = np.zeros(months, dtype=float)
        for prop in props:
            child_seed = int(rng.integers(0, 2**31 - 1))
            result = simulate_property_monthly(prop, seed=child_seed)
            cash_flows = np.array(result["cash_flows"], dtype=float)
            if len(cash_flows) < months:
                cash_flows = np.pad(
                    cash_flows,
                    (0, months - len(cash_flows)),
                    constant_values=0.0,
                )
            total += cash_flows
        sim_cf[index, :] = total

    expected_cf = sim_cf.mean(axis=0)
    p10_cf = np.percentile(sim_cf, 10, axis=0)
    p90_cf = np.percentile(sim_cf, 90, axis=0)

    portfolio_result = PortfolioSimulationResult(
        expected_monthly_cf=expected_cf.tolist(),
        p10_cf=p10_cf.tolist(),
        p90_cf=p90_cf.tolist(),
        horizon_months=months,
    )

    return portfolio_result.model_dump()
