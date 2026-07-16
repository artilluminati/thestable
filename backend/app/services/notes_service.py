from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.paths import REMINDERS_ROOT, VAULT_ROOT
from app.models.notes_index import NotesIndex

TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
# Matches [[Note]], [[Note|Alias]], [[Note#Heading]] - captures just "Note".
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)")


class NotesServiceError(Exception):
    """Raised for invalid paths, missing notes, or notes that already exist."""


def _normalize_path(relative_path: str) -> str:
    relative_path = relative_path.strip().lstrip("/")
    if not relative_path:
        raise NotesServiceError("Note path cannot be empty")
    if not relative_path.endswith(".md"):
        relative_path += ".md"
    return relative_path


def _resolve(relative_path: str) -> Path:
    candidate = (VAULT_ROOT / relative_path).resolve()
    if not candidate.is_relative_to(VAULT_ROOT):
        raise NotesServiceError("Invalid note path")
    return candidate


def _scan_vault_files() -> list[Path]:
    """All *.md files in the vault, except the reminders/ subfolder -
    those are a separate concern (see reminders_service)."""
    if not VAULT_ROOT.exists():
        return []
    files = []
    for path in VAULT_ROOT.rglob("*.md"):
        resolved = path.resolve()
        if resolved == REMINDERS_ROOT or REMINDERS_ROOT in resolved.parents:
            continue
        files.append(path)
    return sorted(files)


def _build_stem_index(files: list[Path]) -> dict[str, str]:
    """Maps lowercase filename stem -> relative path, so [[Note Name]] can
    be resolved the way Obsidian resolves short wikilinks."""
    return {f.stem.lower(): str(f.relative_to(VAULT_ROOT)) for f in files}


def _extract_title(content: str, fallback: str) -> str:
    match = TITLE_RE.search(content)
    return match.group(1).strip() if match else fallback


def _extract_outbound_links(content: str, stem_index: dict[str, str]) -> list[str]:
    targets: set[str] = set()
    for match in WIKILINK_RE.finditer(content):
        raw = match.group(1).strip()
        target = stem_index.get(Path(raw).stem.lower())
        if target:
            targets.add(target)
    return sorted(targets)


def _upsert_index_row(
    db: Session, file_path: Path, relative_path: str, stem_index: dict[str, str]
) -> None:
    content = file_path.read_text(encoding="utf-8")
    title = _extract_title(content, fallback=file_path.stem)
    links = _extract_outbound_links(content, stem_index)
    mtime = datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc)

    row = db.execute(select(NotesIndex).where(NotesIndex.path == relative_path)).scalar_one_or_none()
    if row is None:
        row = NotesIndex(path=relative_path)
        db.add(row)

    row.title = title
    row.outbound_links = links
    row.file_updated_at = mtime
    row.indexed_at = datetime.now(timezone.utc)


def reindex_all(db: Session) -> None:
    """Full vault rescan: (re)indexes every note and drops rows for files
    that no longer exist. Runs once at startup (see main.py's lifespan);
    also exposed as POST /notes/reindex for after edits made outside the
    API (directly in Obsidian, `git pull`, etc.)."""
    files = _scan_vault_files()
    stem_index = _build_stem_index(files)
    seen_paths = set()

    for file_path in files:
        relative_path = str(file_path.relative_to(VAULT_ROOT))
        seen_paths.add(relative_path)
        _upsert_index_row(db, file_path, relative_path, stem_index)

    for row in db.execute(select(NotesIndex)).scalars().all():
        if row.path not in seen_paths:
            db.delete(row)

    db.commit()


def reindex_one(db: Session, relative_path: str) -> None:
    """Refreshes the index row for a single note right after it's written.
    Cheaper than reindex_all() for the common case of saving one note."""
    files = _scan_vault_files()
    stem_index = _build_stem_index(files)
    file_path = _resolve(relative_path)
    if file_path.exists():
        _upsert_index_row(db, file_path, relative_path, stem_index)
        db.commit()


def list_notes(db: Session) -> list[NotesIndex]:
    return list(db.execute(select(NotesIndex).order_by(NotesIndex.title)).scalars())


def read_note(db: Session, relative_path: str) -> dict:
    relative_path = _normalize_path(relative_path)
    file_path = _resolve(relative_path)
    if not file_path.exists():
        raise NotesServiceError("Note not found")

    content = file_path.read_text(encoding="utf-8")
    row = db.execute(select(NotesIndex).where(NotesIndex.path == relative_path)).scalar_one_or_none()

    return {
        "path": relative_path,
        "title": row.title if row else _extract_title(content, file_path.stem),
        "content": content,
        "outbound_links": row.outbound_links if row else [],
        "updated_at": row.file_updated_at
        if row
        else datetime.fromtimestamp(file_path.stat().st_mtime, tz=timezone.utc),
    }


def create_note(db: Session, relative_path: str, content: str) -> dict:
    relative_path = _normalize_path(relative_path)
    file_path = _resolve(relative_path)
    if file_path.exists():
        raise NotesServiceError("A note already exists at this path")

    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding="utf-8")
    reindex_one(db, relative_path)
    return read_note(db, relative_path)


def update_note(db: Session, relative_path: str, content: str) -> dict:
    relative_path = _normalize_path(relative_path)
    file_path = _resolve(relative_path)
    if not file_path.exists():
        raise NotesServiceError("Note not found")

    file_path.write_text(content, encoding="utf-8")
    reindex_one(db, relative_path)
    return read_note(db, relative_path)


def search_notes(db: Session, query: str) -> list[NotesIndex]:
    """Title/path match against the index (fast), plus a full-text grep
    over the actual files (slower, but the vault is personal-sized and
    content is deliberately not duplicated into the DB)."""
    query_lower = query.lower()
    all_rows = {row.path: row for row in db.execute(select(NotesIndex)).scalars()}

    matches = {
        path: row
        for path, row in all_rows.items()
        if query_lower in row.title.lower() or query_lower in path.lower()
    }

    for file_path in _scan_vault_files():
        relative_path = str(file_path.relative_to(VAULT_ROOT))
        if relative_path in matches or relative_path not in all_rows:
            continue
        try:
            content = file_path.read_text(encoding="utf-8")
        except OSError:
            continue
        if query_lower in content.lower():
            matches[relative_path] = all_rows[relative_path]

    return sorted(matches.values(), key=lambda r: r.title)


def get_backlinks(db: Session, relative_path: str) -> list[NotesIndex]:
    relative_path = _normalize_path(relative_path)
    return list(
        db.execute(
            select(NotesIndex).where(NotesIndex.outbound_links.any(relative_path))
        ).scalars()
    )
