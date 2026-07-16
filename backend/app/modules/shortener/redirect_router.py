from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.url_service import UrlServiceError, resolve_and_increment

# Deliberately NOT under /api/v1 - a short link should stay short (example.com/r/abc123),
# and it's not really "an API call" from the user's point of view.
router = APIRouter(tags=["redirect"])


@router.get("/r/{code}")
def redirect_to_original(code: str, db: Session = Depends(get_db)):
    try:
        original_url = resolve_and_increment(db, code)
    except UrlServiceError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return RedirectResponse(url=original_url, status_code=status.HTTP_302_FOUND)
