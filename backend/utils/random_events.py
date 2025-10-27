# backend/utils/random_events.py
import numpy as np

def monthly_vacancy_loss(rng: np.random.Generator, monthly_rent: float, annual_rate: float, volatility: float) -> float:
    # model expected monthly loss as a noisy fraction of rent
    mu_m = annual_rate / 12.0
    sig_m = volatility / np.sqrt(12) if volatility > 0 else 0.0
    frac = float(np.clip(rng.normal(mu_m, sig_m), 0.0, 1.0))
    return monthly_rent * frac

def maintenance_shock(rng: np.random.Generator, lambda_year: float, avg_cost: float) -> float:
    lam_m = max(0.0, lambda_year) / 12.0
    k = int(rng.poisson(lam_m))
    if k <= 0:
        return 0.0
    # lognormal scatter around avg_cost
    sigma = 0.4
    mu = np.log(max(avg_cost, 1e-6)) - 0.5 * sigma**2
    shocks = rng.lognormal(mean=mu, sigma=sigma, size=k)
    return float(shocks.sum())

def growth_step(rng: np.random.Generator, value: float, mean_annual: float, std_annual: float) -> float:
    mu_m = mean_annual / 12.0
    sig_m = std_annual / (12 ** 0.5) if std_annual > 0 else 0.0
    shock = float(rng.normal(mu_m, sig_m))
    return float(value * (1 + shock))