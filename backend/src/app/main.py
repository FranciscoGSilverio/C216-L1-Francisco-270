from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.actors import router as actors_router
from app.api.routes.health import router as health_router
from app.core.config import CORS_ORIGINS

app = FastAPI(title="Cinema API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(health_router)
app.include_router(actors_router)
