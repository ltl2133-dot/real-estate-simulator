from fastapi import APIRouter
from models.property import PropertyInput
from models.simulation import simulate_property_monthly

router = APIRouter()
PORTFOLIO: list[dict] = []

@router.get("")
def list_properties():
    return PORTFOLIO

@router.post("")
def add_property(prop: PropertyInput):
    sim = simulate_property_monthly(prop)
    record = {
        **prop.dict(),
        "monthly_debt": sim.get("monthly_debt", 0.0),
        "irr_monthly": sim.get("irr_monthly", 0.0),
        "irr_annual": sim.get("irr_annual", 0.0),
        "total_value": sim.get("total_value", 0.0),
    }
    PORTFOLIO.append(record)
    return record

@router.delete("")
def clear_portfolio():
    PORTFOLIO.clear()
    return {"status": "cleared"}