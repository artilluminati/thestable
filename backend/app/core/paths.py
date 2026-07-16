from pathlib import Path

from app.core.config import settings

# Computed once at import time. Both notes_service and reminders_service
# import these instead of recomputing settings.vault_path themselves.
VAULT_ROOT = Path(settings.vault_path).resolve()
REMINDERS_ROOT = VAULT_ROOT / settings.reminders_dir_name
