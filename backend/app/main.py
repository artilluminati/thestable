from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.scheduler import start_scheduler, stop_scheduler
from app.db.session import SessionLocal
from app.modules.shortener.redirect_router import router as redirect_router
from app.services.notes_service import reindex_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Bring notes_index up to date with whatever is on disk right now
    # (the vault may have changed while the backend was stopped).
    db = SessionLocal()
    try:
        reindex_all(db)
    finally:
        db.close()

    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(redirect_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
