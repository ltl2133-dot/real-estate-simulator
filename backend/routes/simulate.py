from fastapi import APIRouter, Query
from typing import Optional
from models.property import PropertyInput
from models.simulation import simulate_property_monthly, simulate_portfolio

router = APIRouter()

@router.post("/property")
def run_property(prop: PropertyInput, seed: Optional[int] = None):
    return simulate_property_monthly(prop, seed=seed)

@router.post("/portfolio")
def run_portfolio(payload: dict, sims: int = Query(500, ge=1, le=5000), seed: Optional[int] = None):
    props_data = payload.get("properties", [])
    props = [PropertyInput(**p) if not isinstance(p, PropertyInput) else p for p in props_data]
    return simulate_portfolio(props, simulations=sims, seed=seed)