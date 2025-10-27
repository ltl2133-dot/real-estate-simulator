# backend/utils/random_events.py
import numpy as np

def monthly_vacancy_loss(rng, rent, annual_rate, volatility):
    rate = np.clip(rng.normal(annual_rate / 12, volatility / np.sqrt(12)), 0, 1)
    return rent * rate

def maintenance_shock(rng, lambda_year, avg_cost):
    n_events = rng.poisson(lambda_year / 12)
    if n_events == 0:
        return 0.0
    return n_events * rng.normal(avg_cost, avg_cost * 0.25)

def growth
