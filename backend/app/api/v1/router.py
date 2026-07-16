from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.notes.router import router as notes_router
from app.modules.reminders.router import router as reminders_router
from app.modules.shortener.router import router as shortener_router
from app.modules.users.router import router as users_router

# This is the ONE place that assembles all v1 modules.
# Turning a module "off" (per the platform concept) means removing one line here.
api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(shortener_router)
api_router.include_router(notes_router)
api_router.include_router(reminders_router)
