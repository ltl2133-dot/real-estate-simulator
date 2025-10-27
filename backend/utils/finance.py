import math

def npv(rate, cashflows):
    safe = [float(cf) for cf in cashflows if cf is not None and abs(float(cf)) < 1e12]
    return sum(cf / ((1 + rate) ** t) for t, cf in enumerate(safe))

def irr(cashflows, guess=0.1, max_iter=200, tol=1e-7):
    flows = [float(cf) for cf in cashflows if cf is not None]
    if not flows or all(cf >= 0 for cf in flows) or all(cf <= 0 for cf in flows):
        return 0.0
    lo, hi = -0.999, 10.0
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
    return (lo + hi) / 2

def monthly_payment(principal, annual_rate, term_years, amort_years=None):
    n = (amort_years or term_years) * 12
    r = annual_rate / 12.0
    if r == 0:
        return principal / n
    return principal * r * (1 + r) ** n / ((1 + r) ** n - 1)
