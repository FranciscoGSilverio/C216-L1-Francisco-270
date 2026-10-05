from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.api.routes.items import router as items_router

app = FastAPI()

app.include_router(health_router)
app.include_router(items_router)
