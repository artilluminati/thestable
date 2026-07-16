from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


class AuthError(Exception):
    """Raised for any auth-related business rule violation (bad creds, duplicate user, etc.)."""


def register_user(db: Session, data: UserCreate) -> User:
    existing = db.execute(
        select(User).where((User.username == data.username) | (User.email == data.email))
    ).scalar_one_or_none()
    if existing is not None:
        raise AuthError("Username or email already registered")

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, username: str, password: str) -> User:
    user = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
    if user is None or not verify_password(password, user.password_hash):
        raise AuthError("Invalid username or password")
    return user


def login_user(db: Session, username: str, password: str) -> str:
    user = authenticate_user(db, username, password)
    return create_access_token(subject=str(user.id))
