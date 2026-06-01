from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.middleware.rate_limit import RateLimitMiddleware
from app.routers import industries, resumes, interviews, orders, payments


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (MVP; use Alembic migrations in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="AI Resume API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware, requests_per_minute=30)

# Register routers
app.include_router(industries.router)
app.include_router(resumes.router)
app.include_router(interviews.router)
app.include_router(orders.router)
app.include_router(payments.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
