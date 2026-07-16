from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.short_url import ShortUrlCreate, ShortUrlRead
from app.services.url_service import UrlServiceError, create_short_url, delete_url, list_user_urls

router = APIRouter(prefix="/links", tags=["shortener"])


@router.post("", response_model=ShortUrlRead, status_code=status.HTTP_201_CREATED)
def create_link(
    data: ShortUrlCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_short_url(db, current_user, data)
    except UrlServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("", response_model=list[ShortUrlRead])
def list_links(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_user_urls(db, current_user)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        delete_url(db, current_user, link_id)
    except UrlServiceError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
