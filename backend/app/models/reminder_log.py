from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class ReminderLog(Base):
    """Tracks which scheduled reminder occurrences have already been sent.

    Without this, restarting the backend (or two overlapping scheduler runs)
    could send the same reminder twice. `occurrence_key` uniquely identifies
    one specific scheduled instance (e.g. "daily:2026-07-16").
    """

    __tablename__ = "reminder_log"
    __table_args__ = (
        UniqueConstraint("reminder_path", "occurrence_key", name="uq_reminder_occurrence"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    reminder_path: Mapped[str] = mapped_column(String(1024), index=True, nullable=False)
    occurrence_key: Mapped[str] = mapped_column(String(64), nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
