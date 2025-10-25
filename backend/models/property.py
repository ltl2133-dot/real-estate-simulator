from pydantic import BaseModel, Field
from typing import Optional

class Loan(BaseModel):
    loan_amount: float = Field(..., gt=0)
    interest_rate: float = Field(..., gt=0)  # annual nominal, e.g., 0.06
    term_years: int = Field(30, gt=0)
    amortization_years: Optional[int] = None  # if None, equals term

class PropertyInput(BaseModel):
    name: str
    purchase_price: float = Field(..., gt=0)
    monthly_rent: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)  # fixed opex excluding debt service
    taxes_insurance_monthly: float = Field(0, ge=0)
    capex_reserve_monthly: float = Field(0, ge=0)

    # Simulation knobs
    rent_growth_mean: float = 0.03
    rent_growth_std: float = 0.01
    expense_growth_mean: float = 0.02
    expense_growth_std: float = 0.01

    vacancy_rate_annual: float = 0.06  # long-run avg vacancy (used as base)
    vacancy_volatility: float = 0.02

    appreciation_mean: float = 0.025
    appreciation_std: float = 0.03

    maintenance_shock_lambda: float = 0.15  # avg shocks per year
    maintenance_shock_avg_cost: float = 1200.0

    hold_years: int = 10
    loan: Optional[Loan] = None

class PortfolioInput(BaseModel):
    properties: list[PropertyInput]
