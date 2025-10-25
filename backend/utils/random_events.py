import numpy as np

rng = np.random.default_rng()

# Vacancy: stochastic monthly loss based on annual vacancy and volatility
def monthly_vacancy_loss(monthly_rent: float, annual_rate: float, volatility: float) -> float:
    # Convert annual vacancy to a monthly probability proxy and perturb
    base_monthly = annual_rate / 12
    p = np.clip(rng.normal(base_monthly, volatility / 12), 0, 1)
    vacant = rng.random() < p
    return monthly_rent if vacant else 0.0

# Maintenance shocks: Poisson arrival, lognormal cost
def maintenance_shock(lambda_year: float, avg_cost: float) -> float:
    # Monthly arrival rate
    lam_m = lambda_year / 12
    k = rng.poisson(lam_m)
    if k == 0:
        return 0.0
    # Model cost as lognormal around avg_cost
    mu = np.log(avg_cost) - 0.5 * 0.4**2  # heuristic sigma=0.4
    sigma = 0.4
    costs = np.exp(rng.normal(mu, sigma, size=k))
    return float(costs.sum())

def growth_step(value: float, mean_annual: float, std_annual: float) -> float:
    # Convert to monthly drift/vol and apply geometric-like step
    mu_m = mean_annual / 12
    sig_m = std_annual / (12 ** 0.5)
    # multiplicative step
    shock = rng.normal(mu_m, sig_m)
    return value * (1 + shock)
