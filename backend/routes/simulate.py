from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from models.property import PortfolioInput, PropertyInput
from models.simulation import (
    PortfolioSimulationResult,
    SimulationResult,
    simulate_portfolio,
    simulate_property_monthly,
)

router = APIRouter()


@router.post("/property", response_model=SimulationResult)
def run_property(prop: PropertyInput, seed: Optional[int] = Query(default=None, ge=0)) -> SimulationResult:
    return simulate_property_monthly(prop, seed=seed)


@router.post("/portfolio", response_model=PortfolioSimulationResult)
def run_portfolio(
    payload: PortfolioInput,
    sims: int = Query(500, ge=1, le=5000),
    seed: Optional[int] = Query(default=None, ge=0),
) -> PortfolioSimulationResult:
    if not payload.properties:
        raise HTTPException(status_code=400, detail="At least one property is required")
    return simulate_portfolio(payload.properties, simulations=sims, seed=seed)
