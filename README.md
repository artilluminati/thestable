# Personal Platform — v0.1

Первый срез платформы: аутентификация + модуль URL Shortener.
Дальше в `app/modules/` так же появятся `downloads`, `notes`, `passwords`, `files` —
архитектура для этого уже готова.

## Стек

- Backend: FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Pydantic v2, JWT, uv
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind, shadcn-style UI,
  TanStack Query, React Hook Form, Zod

## Структура

```
personal-platform/
├── backend/
│   ├── app/
│   │   ├── main.py              # точка входа FastAPI, CORS, роутеры
│   │   ├── core/
│   │   │   ├── config.py        # Settings (pydantic-settings, читает .env)
│   │   │   └── security.py      # хэширование паролей, JWT
│   │   ├── db/
│   │   │   ├── base.py          # DeclarativeBase + импорт всех моделей для Alembic
│   │   │   └── session.py       # engine, SessionLocal, get_db()
│   │   ├── models/
│   │   │   ├── user.py          # ORM: users
│   │   │   └── short_url.py     # ORM: short_urls
│   │   ├── schemas/
│   │   │   ├── user.py          # UserCreate / UserRead
│   │   │   ├── auth.py          # LoginRequest / Token
│   │   │   └── short_url.py     # ShortUrlCreate / ShortUrlRead
│   │   ├── services/
│   │   │   ├── auth_service.py  # register_user, authenticate_user, login_user
│   │   │   └── url_service.py   # create/list/delete ссылок, генерация кода, redirect+clicks
│   │   ├── api/
│   │   │   ├── deps.py          # get_current_user (декодирует JWT)
│   │   │   └── v1/router.py     # собирает все модули под /api/v1
│   │   └── modules/
│   │       ├── auth/router.py       # POST /api/v1/auth/register, /login
│   │       ├── users/router.py      # GET /api/v1/users/me
│   │       └── shortener/
│   │           ├── router.py        # POST/GET /api/v1/links, DELETE /api/v1/links/{id}
│   │           └── redirect_router.py  # GET /r/{code} — вне /api/v1, короткий и чистый
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/0001_initial.py   # создаёт users + short_urls
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── .env.example
│   └── Dockerfile
│
├── frontend-files-to-add/   # файлы для копирования в твой существующий frontend/
│   ├── NOTES.md             # как именно интегрировать (читай в первую очередь)
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── middleware.ts
│   ├── .env.local.example
│   └── Dockerfile
│
└── docker-compose.yml       # postgres + backend + frontend
```

## Как обсуждать архитектуру: modules/ vs api/services/models

`modules/{auth,users,shortener}/router.py` — это "включаемые" фичи платформы
(в духе идеи из твоего плана: каждый модуль можно выключить отдельной строкой
в `api/v1/router.py`). А `core/`, `db/`, `models/`, `schemas/`, `services/` —
общий фундамент, которым модули пользуются. Так проект не расползается:
новый модуль (например, `downloads`) добавляет свою папку в `modules/`,
опирается на существующие `core/security.py`, `db/session.py`, `api/deps.py`,
и одной строкой подключается в `api/v1/router.py`.

## Запуск локально (без Docker)

### Backend

```bash
cd backend
cp .env.example .env        # поправь SECRET_KEY и DATABASE_URL при необходимости
uv sync
# нужен запущенный Postgres, например:
# docker run --name pp-postgres -e POSTGRES_USER=platform -e POSTGRES_PASSWORD=platform \
#   -e POSTGRES_DB=platform -p 5432:5432 -d postgres:16-alpine
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

API поднимется на `http://localhost:8000`, документация — на `/docs`.

### Frontend

Сначала прочитай `frontend-files-to-add/NOTES.md` — там про интеграцию
в уже созданный тобой Next.js проект. Коротко:

```bash
cd frontend
npm install @tanstack/react-query react-hook-form zod @hookform/resolvers \
            clsx tailwind-merge class-variance-authority lucide-react
cp ../frontend-files-to-add/.env.local.example .env.local
npm run dev
```

## Запуск через Docker Compose

```bash
docker compose up --build
```

Backend — `localhost:8000`, frontend — `localhost:3000`, Postgres — `localhost:5432`.
Перед первым запуском один раз примени миграции внутри контейнера:

```bash
docker compose exec backend uv run alembic upgrade head
```

## API v0.1

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/me
POST   /api/v1/links
GET    /api/v1/links
DELETE /api/v1/links/{id}
GET    /r/{code}          # редирект + инкремент clicks
```

## Осознанные упрощения v0.1 (по плану "не делать всё универсальным")

- Один access-токен без refresh-токенов — добавим, когда понадобится дольше жить в системе.
- Кука с токеном не httpOnly (backend и frontend на разных origin в dev) —
  для прод-деплоя за одним доменом стоит переключить на httpOnly-куку от backend.
- Нет password/expires_at/max_clicks у ссылок — сознательно оставлено на "Позже"
  из твоего плана, модель `ShortUrl` и `ShortUrlCreate` расширяются без миграции-ужаса.
- Тесты не включены в v0.1 — стоит добавить как только модуль shortener стабилизируется.

## Git-история (как в плане)

```
feat(backend): project skeleton, config, security
feat(auth): register + login endpoints
feat(shortener): create/list/delete links + redirect with click tracking
feat(db): alembic migrations for users and short_urls
feat(frontend): login/register pages, auth cookie handling
feat(frontend): dashboard with url form and url list
chore: docker-compose for postgres+backend+frontend
```
