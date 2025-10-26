from pydantic import BaseModel, Field
from typing import Optional

class Loan(BaseModel):
    loan_amount: Optional[float] = Field(0, ge=0)
    interest_rate: Optional[float] = Field(0.05, ge=0)
    term_years: Optional[int] = Field(30, ge=1)
    amortization_years: Optional[int] = 30  # default matches term

class PropertyInput(BaseModel):
    name: Optional[str] = "Unnamed Property"
    purchase_price: Optional[float] = Field(0, ge=0)
    monthly_rent: Optional[float] = Field(0, ge=0)
    monthly_expenses: Optional[float] = Field(0, ge=0)
    taxes_insurance_monthly: Optional[float] = Field(0, ge=0)
    capex_reserve_monthly: Optional[float] = Field(0, ge=0)

    # Simulation knobs
    rent_growth_mean: Optional[float] = 0.03
    rent_growth_std: Optional[float] = 0.01
    expense_growth_mean: Optional[float] = 0.02
    expense_growth_std: Optional[float] = 0.01

    vacancy_rate_annual: Optional[float] = 0.06
    vacancy_volatility: Optional[float] = 0.02

    appreciation_mean: Optional[float] = 0.025
    appreciation_std: Optional[float] = 0.03

    maintenance_shock_lambda: Optional[float] = 0.15
    maintenance_shock_avg_cost: Optional[float] = 1200.0

    hold_years: Optional[int] = 10
    loan: Optional[Loan] = Loan()

class PortfolioInput(BaseModel):
    properties: list[PropertyInput]
