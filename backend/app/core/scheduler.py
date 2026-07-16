import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.db.session import SessionLocal
from app.services.reminders_service import check_and_send_due_reminders

logger = logging.getLogger(__name__)

# BackgroundScheduler runs jobs in a plain thread (not asyncio), which is
# exactly what we want here: check_and_send_due_reminders() uses the sync
# SQLAlchemy Session and a blocking httpx call, same as the rest of the app.
scheduler = BackgroundScheduler(timezone="UTC")


def _run_reminder_check() -> None:
    db = SessionLocal()
    try:
        check_and_send_due_reminders(db)
    except Exception:
        # A bad reminder file or a Telegram hiccup must never kill the
        # scheduler thread - just log it and try again next minute.
        logger.exception("Reminder check failed")
    finally:
        db.close()


def start_scheduler() -> None:
    if scheduler.running:
        return
    scheduler.add_job(
        _run_reminder_check,
        trigger=CronTrigger(second=0),  # fires once every minute, at :00 seconds
        id="reminder_check",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.start()


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
