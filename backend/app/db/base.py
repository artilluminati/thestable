from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""

    pass


# Models are imported here (not at the top) so that Alembic's
# autogenerate can discover every table via Base.metadata,
# without creating circular imports between base.py and the models.
# from app.models.user import User  # noqa: E402, F401
# from app.models.short_url import ShortUrl  # noqa: E402, F401
