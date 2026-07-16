from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.notes_index import NotesIndex
from app.models.user import User
from app.schemas.note import NoteCreate, NoteRead, NoteSummary, NoteUpdate
from app.services import notes_service
from app.services.notes_service import NotesServiceError

router = APIRouter(prefix="/notes", tags=["notes"])


def _to_summary(row: NotesIndex) -> NoteSummary:
    return NoteSummary(path=row.path, title=row.title, updated_at=row.file_updated_at)


@router.get("", response_model=list[NoteSummary])
def list_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [_to_summary(row) for row in notes_service.list_notes(db)]


@router.get("/search", response_model=list[NoteSummary])
def search_notes(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [_to_summary(row) for row in notes_service.search_notes(db, q)]


@router.post("/reindex", status_code=status.HTTP_204_NO_CONTENT)
def reindex(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rescans the whole vault. Useful after edits made outside the API
    (directly in Obsidian, `git pull`, etc.) since those don't trigger
    the automatic per-note reindex that create/update do."""
    notes_service.reindex_all(db)


# IMPORTANT: "/{path:path}/backlinks" must be registered BEFORE the bare
# "/{path:path}" route below. FastAPI/Starlette tries routes in registration
# order, and the ":path" converter is greedy - if the bare route came first,
# a request to /notes/foo.md/backlinks would match it with
# path="foo.md/backlinks" instead of reaching read_backlinks.
@router.get("/{path:path}/backlinks", response_model=list[NoteSummary])
def read_backlinks(
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [_to_summary(row) for row in notes_service.get_backlinks(db, path)]


@router.get("/{path:path}", response_model=NoteRead)
def read_note(
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return notes_service.read_note(db, path)
    except NotesServiceError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(
    data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return notes_service.create_note(db, data.path, data.content)
    except NotesServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{path:path}", response_model=NoteRead)
def update_note(
    path: str,
    data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return notes_service.update_note(db, path, data.content)
    except NotesServiceError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
