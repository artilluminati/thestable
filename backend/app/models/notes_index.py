from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class NotesIndex(Base):
    """Metadata index over the vault's markdown files.

    Deliberately does NOT store note content - only what's needed for fast
    listing, title/path search, and backlink lookups (`outbound_links`).
    The actual markdown always lives in the file on disk; this table is
    just a cache that gets rebuilt from the vault (see notes_service.reindex_*).
    """

    __tablename__ = "notes_index"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str] = mapped_column(String(1024), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    outbound_links: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    file_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    indexed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
