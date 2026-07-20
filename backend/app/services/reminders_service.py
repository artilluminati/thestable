from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime
from datetime import time as dtime
from pathlib import Path
from zoneinfo import ZoneInfo

import frontmatter
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.paths import REMINDERS_ROOT, VAULT_ROOT
from app.core.telegram import TelegramNotConfigured, send_telegram_message
from app.models.reminder_log import ReminderLog

logger = logging.getLogger(__name__)

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


class ReminderServiceError(Exception):
    """Raised when a requested reminder file doesn't exist or has no schedule."""


@dataclass
class ParsedReminder:
    path: str       # relative to VAULT_ROOT, e.g. "reminders/vitamins.md"
    title: str
    message: str    # sent as the Telegram message body
    schedule: dict  # raw "schedule" frontmatter, see vault/reminders/*.md examples


def _iter_reminder_files() -> list[Path]:
    if not REMINDERS_ROOT.exists():
        return []
    return sorted(REMINDERS_ROOT.rglob("*.md"))


def _load_reminder(file_path: Path) -> ParsedReminder | None:
    post = frontmatter.load(str(file_path))
    schedule = post.get("schedule")
    if not schedule:
        return None  # a plain .md file with no "schedule" key - not a reminder

    relative_path = str(file_path.resolve().relative_to(VAULT_ROOT))
    title = post.get("title") or file_path.stem
    body = post.content.strip() or title
    return ParsedReminder(path=relative_path, title=title, message=body, schedule=schedule)


def list_reminders() -> list[ParsedReminder]:
    reminders = []
    for file_path in _iter_reminder_files():
        parsed = _load_reminder(file_path)
        if parsed:
            reminders.append(parsed)
    return reminders


def get_reminder(relative_path: str) -> ParsedReminder:
    """Used by the manual 'test send' endpoint."""
    file_path = (VAULT_ROOT / relative_path).resolve()
    if not file_path.is_relative_to(REMINDERS_ROOT) or not file_path.exists():
        raise ReminderServiceError("Reminder not found")

    parsed = _load_reminder(file_path)
    if parsed is None:
        raise ReminderServiceError("This file has no 'schedule' in its frontmatter")
    return parsed


def _parse_time(value) -> dtime:
    # Превращаем в строку, если пришло число (например, 12 -> "12")
    if isinstance(value, int):
        value = str(value)
        
    # Если время пришло как число без минут (например, "12"), добавляем минуты
    if ":" not in value:
        value = f"{value}:00"
        
    hour, minute = value.split(":")
    return dtime(int(hour), int(minute))


def _matches_now(schedule: dict, now: datetime) -> tuple[bool, str | None]:
    """Checks whether `schedule` has an occurrence exactly at `now` (minute
    precision). Returns (fires, occurrence_key) - the key uniquely
    identifies this specific scheduled instance, so it can be checked
    against ReminderLog to avoid sending the same occurrence twice.

    Supported schedule["type"] values:
      once:     {date: "YYYY-MM-DD", time: "HH:MM"}
      daily:    {time: "HH:MM"}
      weekly:   {days: ["mon", "thu", ...], time: "HH:MM"}
      monthly:  {day_of_month: 1-31, time: "HH:MM"}
      interval: {start_date: "YYYY-MM-DD", every_days: N, time: "HH:MM"}
    """
    now_minute = now.replace(second=0, microsecond=0)
    schedule_type = schedule.get("type")

    if schedule_type == "once":
        target = datetime.combine(
            date.fromisoformat(schedule["date"]), _parse_time(schedule["time"]), tzinfo=now.tzinfo
        )
        if now_minute == target:
            return True, f"once:{target.isoformat()}"
        return False, None

    # every recurring type below fires on a fixed time-of-day
    if now_minute.time() != _parse_time(schedule["time"]):
        return False, None

    if schedule_type == "daily":
        return True, f"daily:{now_minute.date().isoformat()}"

    if schedule_type == "weekly":
        days = {d.lower() for d in schedule.get("days", [])}
        if WEEKDAYS[now_minute.weekday()] in days:
            return True, f"weekly:{now_minute.date().isoformat()}"
        return False, None

    if schedule_type == "monthly":
        if now_minute.day == int(schedule["day_of_month"]):
            return True, f"monthly:{now_minute.date().isoformat()}"
        return False, None

    if schedule_type == "interval":
        start = date.fromisoformat(schedule["start_date"])
        every = int(schedule["every_days"])
        if every > 0 and now_minute.date() >= start and (now_minute.date() - start).days % every == 0:
            return True, f"interval:{now_minute.date().isoformat()}"
        return False, None

    logger.warning("Unknown reminder schedule type: %r", schedule_type)
    return False, None


def check_and_send_due_reminders(db: Session) -> None:
    """Called once a minute by the scheduler (app/core/scheduler.py)."""
    now = datetime.now(ZoneInfo(settings.timezone))

    for reminder in list_reminders():
        try:
            fires, occurrence_key = _matches_now(reminder.schedule, now)
        except (KeyError, ValueError) as exc:
            logger.warning("Bad schedule in %s: %s", reminder.path, exc)
            continue

        if not fires:
            continue

        already_sent = db.execute(
            select(ReminderLog).where(
                ReminderLog.reminder_path == reminder.path,
                ReminderLog.occurrence_key == occurrence_key,
            )
        ).scalar_one_or_none()
        if already_sent:
            continue

        try:
            send_telegram_message(f"*{reminder.title}*\n\n{reminder.message}")
        except TelegramNotConfigured:
            logger.warning("Reminder '%s' is due but Telegram isn't configured", reminder.path)
            continue

        db.add(ReminderLog(reminder_path=reminder.path, occurrence_key=occurrence_key))
        db.commit()
