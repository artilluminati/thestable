"""notes_index and reminder_log tables

Revision ID: 0002_notes_reminders
Revises: 0001_initial
Create Date: 2026-07-16
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_notes_reminders"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notes_index",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("path", sa.String(length=1024), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column(
            "outbound_links", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"
        ),
        sa.Column("file_updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("indexed_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_notes_index_path", "notes_index", ["path"], unique=True)

    op.create_table(
        "reminder_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("reminder_path", sa.String(length=1024), nullable=False),
        sa.Column("occurrence_key", sa.String(length=64), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("reminder_path", "occurrence_key", name="uq_reminder_occurrence"),
    )
    op.create_index("ix_reminder_log_reminder_path", "reminder_log", ["reminder_path"])


def downgrade() -> None:
    op.drop_index("ix_reminder_log_reminder_path", table_name="reminder_log")
    op.drop_table("reminder_log")
    op.drop_index("ix_notes_index_path", table_name="notes_index")
    op.drop_table("notes_index")
