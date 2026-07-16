import httpx

from app.core.config import settings


class TelegramNotConfigured(Exception):
    """Raised when TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID aren't set in .env."""


def send_telegram_message(text: str) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        raise TelegramNotConfigured("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not set")

    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    response = httpx.post(
        url,
        json={
            "chat_id": settings.telegram_chat_id,
            "text": text,
            "parse_mode": "Markdown",
        },
        timeout=10,
    )
    response.raise_for_status()
