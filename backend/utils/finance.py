import numpy as np

# IRR/NPV utilities

def npv(rate: float, cashflows: list[float]) -> float:
    return sum(cf / ((1 + rate) ** t) for t, cf in enumerate(cashflows, start=0))

def irr(cashflows: list[float], guess: float = 0.1, max_iter: int = 100, tol: float = 1e-6) -> float:
    # Newton-Raphson
    rate = guess
    for _ in range(max_iter):
        # f(rate) = NPV = 0
        f = npv(rate, cashflows)
        # derivative of NPV wrt rate
        df = sum(-t * cf / ((1 + rate) ** (t + 1)) for t, cf in enumerate(cashflows, start=0))
        if abs(df) < 1e-12:
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
