from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, validator


class Loan(BaseModel):
    loan_amount: float = Field(0, ge=0)
    interest_rate: float = Field(0.05, ge=0)
    term_years: int = Field(30, ge=1)
    amortization_years: Optional[int] = Field(default=None, ge=1)

    @validator("interest_rate", pre=True)
    def _normalise_rate(cls, value: float | str | None) -> float:
        if value is None:
            return 0.0
        rate = float(value)
        if rate > 1:
            rate /= 100.0
        return max(rate, 0.0)

    @validator("amortization_years", always=True)
    def _default_amortization(cls, value: Optional[int], values: dict[str, object]) -> Optional[int]:
        term = int(values.get("term_years", 0) or 0)
        if not value:
            return term
        return max(int(value), 1)


class PropertyInput(BaseModel):
    name: str = Field("Unnamed Property", max_length=120)
    purchase_price: float = Field(0, ge=0)
    monthly_rent: float = Field(0, ge=0)
    monthly_expenses: float = Field(0, ge=0)
    taxes_insurance_monthly: float = Field(0, ge=0)
    capex_reserve_monthly: float = Field(0, ge=0)

    rent_growth_mean: float = 0.03
    rent_growth_std: float = 0.01
    expense_growth_mean: float = 0.02
    expense_growth_std: float = 0.01

    vacancy_rate_annual: float = 0.06
    vacancy_volatility: float = 0.02

    appreciation_mean: float = 0.025
    appreciation_std: float = 0.03

    maintenance_shock_lambda: float = 0.15
    maintenance_shock_avg_cost: float = 1200.0

    hold_years: int = Field(10, ge=1)
    loan: Optional[Loan] = None

    class Config:
        anystr_strip_whitespace = True
        validate_assignment = True
        extra = "ignore"


class PortfolioInput(BaseModel):
    properties: list[PropertyInput] = Field(default_factory=list)


class PortfolioEntry(PropertyInput):
    monthly_debt: float = 0.0
    irr_monthly: float = 0.0
    irr_annual: float = 0.0
    total_value: float = 0.0

    class Config(PropertyInput.Config):
        pass
