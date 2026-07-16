from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Personal Platform"
    environment: str = "development"
    debug: bool = True

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    database_url: str

    frontend_origin: str = "http://localhost:3000"

    # Notes module: path is relative to the process's working directory
    # (i.e. relative to backend/ when you run uvicorn from there, or to
    # /app when running inside the backend Docker container).
    vault_path: str = "./vault"
    # Subfolder of the vault reserved for reminder files; excluded from
    # the Notes module's indexing/search/backlinks.
    reminders_dir_name: str = "reminders"

    # Wall-clock timezone reminder times ("09:00" etc.) are interpreted in.
    timezone: str = "Europe/Sofia"

    # Leave both unset to disable sending; the scheduler will just log and skip.
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
