from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.simulate import router as simulate_router
from routes.portfolio import router as portfolio_router

# ------------------------------------------------------------
# FastAPI Application Setup
# ------------------------------------------------------------
app = FastAPI(
    title="Real Estate Portfolio Simulator API",
    version="0.1.0",
    description="Backend service powering the Real Estate Portfolio Simulator with simulation and portfolio routes."
)

# ------------------------------------------------------------
# CORS Configuration
# ------------------------------------------------------------
origins = [
    "http://localhost:5173",  # local dev
    "https://real-estate-simulator-gules.vercel.app",  # main production
    "https://real-estate-simulator.vercel.app",  # fallback root
    "https://real-estate-simulator-git-main-lucas-lees-projects-0fed4c6c.vercel.app",  # Vercel preview builds
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# Routers
# ------------------------------------------------------------
app.include_router(simulate_router, prefix="/simulate", tags=["simulate"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])

# ------------------------------------------------------------
# Root Health Check
# ------------------------------------------------------------
@app.get("/")
def root():
    return {"status": "ok", "service": "Real Estate Portfolio Simulator API"}
