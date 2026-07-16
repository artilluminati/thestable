import secrets
import string

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.short_url import ShortUrl
from app.models.user import User
from app.schemas.short_url import ShortUrlCreate

ALPHABET = string.ascii_letters + string.digits


class UrlServiceError(Exception):
    """Raised for shortener business rule violations (taken alias, not found, ...)."""


def _generate_code(length: int = 7) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


def create_short_url(db: Session, user: User, data: ShortUrlCreate) -> ShortUrl:
    code = data.custom_alias

    if code:
        existing = db.execute(select(ShortUrl).where(ShortUrl.short_code == code)).scalar_one_or_none()
        if existing is not None:
            raise UrlServiceError("This alias is already taken")
    else:
        code = _generate_code()
        while db.execute(select(ShortUrl).where(ShortUrl.short_code == code)).scalar_one_or_none():
            code = _generate_code()

    short_url = ShortUrl(
        user_id=user.id,
        original_url=str(data.original_url),
        short_code=code,
    )
    db.add(short_url)
    db.commit()
    db.refresh(short_url)
    return short_url


def list_user_urls(db: Session, user: User) -> list[ShortUrl]:
    return list(
        db.execute(
            select(ShortUrl).where(ShortUrl.user_id == user.id).order_by(ShortUrl.created_at.desc())
        ).scalars()
    )


def delete_url(db: Session, user: User, url_id: int) -> None:
    short_url = db.execute(
        select(ShortUrl).where(ShortUrl.id == url_id, ShortUrl.user_id == user.id)
    ).scalar_one_or_none()
    if short_url is None:
        raise UrlServiceError("Link not found")
    db.delete(short_url)
    db.commit()


def resolve_and_increment(db: Session, code: str) -> str:
    short_url = db.execute(select(ShortUrl).where(ShortUrl.short_code == code)).scalar_one_or_none()
    if short_url is None:
        raise UrlServiceError("Link not found")
    short_url.clicks += 1
    db.commit()
    return short_url.original_url
