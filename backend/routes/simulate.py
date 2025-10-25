from fastapi import APIRouter
from models.property import PropertyInput, PortfolioInput
from models.simulation import simulate_property_monthly, simulate_portfolio

router = APIRouter()

@router.post("/property")
def run_property_simulation(prop: PropertyInput):
    return simulate_property_monthly(prop)

@router.post("/portfolio")
def run_portfolio_simulation(portfolio: PortfolioInput, simulations: int = 500):
    return simulate_portfolio(portfolio.properties, simulations=simulations)
