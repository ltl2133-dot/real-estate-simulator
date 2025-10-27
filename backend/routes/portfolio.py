from __future__ import annotations

from fastapi import APIRouter

from models.property import PortfolioEntry, PropertyInput
from models.simulation import simulate_property_monthly

router = APIRouter()

PORTFOLIO: list[PortfolioEntry] = []


@router.get("", response_model=list[PortfolioEntry])
def list_properties() -> list[PortfolioEntry]:
    return PORTFOLIO


@router.post("", response_model=PortfolioEntry)
def add_property(prop: PropertyInput) -> PortfolioEntry:
    sim = simulate_property_monthly(prop)
    record = PortfolioEntry(
        **prop.dict(),
        monthly_debt=sim.monthly_debt,
        irr_monthly=sim.irr_monthly,
        irr_annual=sim.irr_annual,
        total_value=sim.total_value,
    )
    PORTFOLIO.append(record)
    return record


@router.delete("", response_model=dict)
def clear_portfolio() -> dict[str, str]:
    PORTFOLIO.clear()
    return {"status": "cleared"}
