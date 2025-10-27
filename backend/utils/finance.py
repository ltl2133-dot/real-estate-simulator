import math

def npv(rate: float, flows: list[float]) -> float:
    # guard exact -1
    if abs(rate + 1.0) < 1e-12:
        rate += 1e-9
    return sum(cf / ((1.0 + rate) ** t) for t, cf in enumerate(flows))

def irr(flows: list[float], tol: float = 1e-6, max_iter: int = 200) -> float:
    """
    Robust MONTHLY IRR via bisection. Returns 0.0 if no root or unstable.
    """
    flows = [float(cf) for cf in flows if cf is not None]
    if not flows or all(cf >= 0 for cf in flows) or all(cf <= 0 for cf in flows):
        return 0.0

    lo, hi = -0.9999, 10.0
    f_lo, f_hi = npv(lo, flows), npv(hi, flows)
    tries = 0
    while f_lo * f_hi > 0 and tries < 20:
        hi *= 1.5
        f_hi = npv(hi, flows)
        tries += 1
        if hi > 1e6:
            return 0.0
    if f_lo * f_hi > 0:
        return 0.0

    for _ in range(max_iter):
        mid = (lo + hi) / 2
        f_mid = npv(mid, flows)
        if abs(f_mid) < tol:
            return mid
        if f_lo * f_mid < 0:
            hi, f_hi = mid, f_mid
        else:
            lo, f_lo = mid, f_mid
    return 0.0

def annualize(rate: float, periods_per_year: int = 12) -> float:
    try:
        return (1.0 + rate) ** periods_per_year - 1.0
    except Exception:
        return 0.0

def monthly_payment(loan_amount: float, annual_rate: float, term_years: int, amortization_years: int | None = None) -> float:
    """
    Standard amortizing monthly payment; amortization defaults to term.
    """
    if amortization_years is None:
        amortization_years = term_years
    if amortization_years <= 0:
        return 0.0
    r = annual_rate / 12.0
    n = int(amortization_years * 12)
    if n <= 0:
        return 0.0
    if abs(r) < 1e-12:
        return loan_amount / n
    num = loan_amount * r * (1 + r) ** n
    den = (1 + r) ** n - 1
    if abs(den) < 1e-12:
        return 0.0
    return num / den