import numpy as np

# IRR/NPV utilities

def npv(rate, cashflows):
    safe_flows = [cf for cf in cashflows if isinstance(cf, (int, float)) and abs(cf) < 1e12]
    return sum(cf / ((1 + rate) ** t) for t, cf in enumerate(safe_flows, start=0))

def irr(cashflows: list[float], guess: float = 0.1, max_iter: int = 100, tol: float = 1e-6) -> float:
    # Clean and validate inputs first
    cashflows = [
        float(cf)
        for cf in cashflows
        if cf is not None and isinstance(cf, (int, float)) and abs(cf) < 1e12
    ]

    # If no valid cashflows left, return 0 to avoid overflow
    if not cashflows:
        return 0.0

    # Newton-Raphson iteration for IRR
    rate = guess
    for _ in range(max_iter):
        try:
            f = npv(rate, cashflows)
            df = sum(-t * cf / ((1 + rate) ** (t + 1)) for t, cf in enumerate(cashflows, start=0))
        except OverflowError:
            # Safety fallback: if math still blows up, stop early
            return 0.0

        if abs(df) < 1e-12:  # derivative too small → unstable
            break
        new_rate = rate - f / df
        if abs(new_rate - rate) < tol:
            return new_rate
        rate = new_rate

    return rate

def monthly_payment(principal: float, annual_rate: float, term_years: int) -> float:
    r = annual_rate / 12
    n = term_years * 12
    if r == 0:
        return principal / n
    return principal * (r * (1 + r) ** n) / ((1 + r) ** n - 1)
