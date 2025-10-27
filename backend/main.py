from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.simulate import router as simulate_router
from routes.portfolio import router as portfolio_router

app = FastAPI(title="Real Estate Portfolio Simulator API", version="1.0.0")

# CORS: localhost + any vercel.app domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate_router, prefix="/simulate", tags=["simulate"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])

@app.get("/")
def root():
    return {"status": "ok", "service": "Real Estate Portfolio Simulator API"}