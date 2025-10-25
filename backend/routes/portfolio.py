from fastapi import APIRouter
from models.property import PropertyInput

# In-memory store for MVP; swap with DB later
PORTFOLIO: list[PropertyInput] = []

router = APIRouter()

@router.get("")
def list_properties():
    return PORTFOLIO

@router.post("")
def add_property(prop: PropertyInput):
    PORTFOLIO.append(prop)
    return {"status": "added", "count": len(PORTFOLIO)}

@router.delete("")
def clear_portfolio():
    PORTFOLIO.clear()
    return {"status": "cleared"}
