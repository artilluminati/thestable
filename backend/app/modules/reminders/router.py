from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.telegram import TelegramNotConfigured, send_telegram_message
from app.models.user import User
from app.schemas.reminder import ReminderRead
from app.services.reminders_service import ReminderServiceError, get_reminder, list_reminders

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("", response_model=list[ReminderRead])
def get_reminders(current_user: User = Depends(get_current_user)):
    """Lists every reminder file found in vault/reminders/, parsed from
    its frontmatter. Read-only - reminders are still edited as plain
    markdown files (via the Notes module or directly in Obsidian)."""
    return [ReminderRead(path=r.path, title=r.title, schedule=r.schedule) for r in list_reminders()]


@router.post("/{path:path}/test", status_code=status.HTTP_204_NO_CONTENT)
def send_test_reminder(path: str, current_user: User = Depends(get_current_user)):
    """Sends a reminder's message right now, ignoring its schedule.
    Handy for checking that TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID actually work."""
    try:
        reminder = get_reminder(path)
    except ReminderServiceError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    try:
        send_telegram_message(f"*{reminder.title}* (тест)\n\n{reminder.message}")
    except TelegramNotConfigured as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
