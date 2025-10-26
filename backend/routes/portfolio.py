from fastapi import APIRouter
from models.property import PropertyInput
from models.simulation import simulate_property_monthly

# In-memory portfolio list; replace with database later
PORTFOLIO: list[dict] = []

router = APIRouter()

@router.get("")
def list_properties():
    return PORTFOLIO


@router.post("")
def add_property(prop: PropertyInput):
    # Run backend financial simulation
    sim_result = simulate_property_monthly(prop)

    # Merge property inputs with simulation outputs
    property_dict = prop.dict()
    property_dict.update({
        "irr": sim_result.get("irr"),
        "monthly_debt": sim_result.get("monthly_debt"),
        "cash_flows": sim_result.get("cash_flows", []),
        "total_value": sim_result.get("total_value", 0)
    })

    # Save to in-memory portfolio
    PORTFOLIO.append(property_dict)

    # Return full property object (inputs + computed results)
    return property_dict


@router.delete("")
def clear_portfolio():
    PORTFOLIO.clear()
    return {"status": "cleared"}
