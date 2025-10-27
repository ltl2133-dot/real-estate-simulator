from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.simulate import router as simulate_router
from routes.portfolio import router as portfolio_router

app = FastAPI(title="Real Estate Portfolio Simulator API", version="1.0.0")

vite_ports = range(5173, 5176)
local_hosts = ("http://localhost", "http://127.0.0.1")

allowed_origins = [f"{host}:{port}" for host in local_hosts for port in vite_ports]

# Preserve preview/alternate dev hosts that the frontend tooling may use.
allowed_origins.extend(
    [
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate_router, prefix="/simulate", tags=["simulate"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "service": "Real Estate Portfolio Simulator API"}
