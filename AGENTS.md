# PIXA workspace — AI / agent context

This file is the **canonical map** of the repository for humans and coding agents. Prefer it over template-only docs inside subfolders when paths or stacks disagree.

## What this workspace is

- **PIXA** is a CRM-style product split into:
  - **Frontend SPA**: `pixa-cloud-fe/` — React 18, Vite, TypeScript, Tailwind, React Router. Talks to the Python API over HTTP (`client/lib/api.ts`, `client/constants/apiPaths.ts`).
  - **Backend API**: `pixa-cloud-be/` — **FastAPI**, SQLAlchemy 2, Pydantic 2, PostgreSQL, Alembic, JWT. **Not** NestJS.
- **Root-level docs** (workflows, conventions, prompts — gom trong `docs/guides/`):
  - `README.md` — giới thiệu monorepo, **cách dùng & duy trì AI-aware codebase**.
  - `CONTRIBUTING.md` — local setup, dev commands.
  - [`docs/dropdown.md`](./docs/dropdown.md) — **CRM プルダウン・選択肢**（日本語ラベル）+ コードベース（`CustomSelect`, マスタ, DB）へのマッピング。
  - [`docs/guides/README.md`](./docs/guides/README.md) — mục lục hướng dẫn.
  - [`docs/guides/frontend-conventions.md`](./docs/guides/frontend-conventions.md) — FE patterns (RHF, Zod, Zustand, UI, tests).
  - [`docs/guides/backend-conventions.md`](./docs/guides/backend-conventions.md) — BE patterns (FastAPI, repo, schemas).
  - [`docs/guides/task-workflows-and-dod.md`](./docs/guides/task-workflows-and-dod.md) — luồng refactor/code + checklist DoD + phụ lục.
  - [`docs/guides/basic-design-authoring.md`](./docs/guides/basic-design-authoring.md) — viết Basic Design (BD).
  - [`docs/DB_DESIGN_new_crm.md`](./docs/DB_DESIGN_new_crm.md) — database design reference.
- **Claude Code / agent tooling:** thư mục [`.claude/`](./.claude/) — cấu hình project, hooks, skills (xem bảng dưới).

### `.claude/` — links trực tiếp

| Path | Ghi chú |
|------|---------|
| [`.claude/settings.json`](./.claude/settings.json) | Cấu hình Claude Code cho repo này |
| [`.claude/hooks/pre-commit.md`](./.claude/hooks/pre-commit.md) | Tài liệu / quy ước hook pre-commit |
| [`.claude/skills/code-review/SKILL.md`](./.claude/skills/code-review/SKILL.md) | Skill **code-review** |
| [`.claude/skills/refactor/SKILL.md`](./.claude/skills/refactor/SKILL.md) | Skill **refactor** |
| [`.claude/skills/release/SKILL.md`](./.claude/skills/release/SKILL.md) | Skill **release** |
| [`.claude/memory.md`](./.claude/memory.md) | **Log sau mỗi task** prompt code/refactor (template + hướng dẫn append; không thay `AGENTS` / `docs/guides`) |

## Layers (sourced from `docs/guides/frontend-conventions.md` & `docs/guides/backend-conventions.md`)

Tóm tắt kiến trúc theo **tầng** để agent/dev đặt code đúng chỗ. Chi tiết đầy đủ nằm trong hai file conventions ở `docs/guides/`.

### Layer 0 — Documentation & agent context (repo root)

- **Vai trò:** hướng dẫn con người + AI, không chứa business runtime.
- **Nội dung:** `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CLAUDE.md`, [`docs/guides/`](./docs/guides/), `docs/DB_DESIGN_new_crm.md`, [`.claude/`](./.claude/), [`.cursor/rules/`](./.cursor/rules/).

### Layer 1 — Frontend: presentation & client app (`pixa-cloud-fe/`)

- **Stack (study FE):** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, **React Hook Form + Zod**, **TanStack React Query**, **Zustand**, Radix/shadcn-style UI trong `components/ui/`, Lucide, Sonner, Framer Motion, Recharts; test **Vitest + Testing Library + jsdom**.
- **Routing & auth:** `client/App.tsx` (many routes); **ProtectedRoute** (cần token), **CrmRoute** (LEVEL1); public `/login`, `/form-view`; roles **LEVEL1 / LEVEL2 / LEVEL3**; auth trong Zustand (`accessToken`, `refreshToken`, `user`); login throttle (vd. 5 lần → khóa 60s).
- **Gọi API thật:** `client/lib/api.ts` — `get/post/put/delete`, base **`VITE_API_BASE`** (mặc định `http://localhost:8000/api/v1`), gắn `Authorization`, ném `ApiError`. Paths tập trung ở `client/constants/apiPaths.ts`.
- **State (study FE):** API cache → **React Query**; field form + validate → **RHF + Zod**; filter list / UI toàn cục → **Zustand** (`client/stores/`); orchestrate navigate/toast/mutation dài → **custom hooks** (`use*Events`, `use*FormPage`, …).
- **UI patterns:** `cn()` + CVA; admin dùng **`FORM_ANIM_STYLES`** (`client/styles/form-animations.ts`); bảng dùng primitives **Table / TableHeader / TableRow / TableHead / TableCell**, **`TableScrollButtons`**, **`PaginationFooter`**; notch fields **`NotchInput` / `NotchTextarea`**; ngày giờ qua `@/lib/formatDate` + constants — tránh nhân đôi logic (xem [frontend-conventions §8](./docs/guides/frontend-conventions.md)).
- **Express trong `pixa-cloud-fe/server/`:** mock / phụ trợ template (fusion-starter); **CRM production** không coi đây là nguồn API chính.

### Layer 2 — Backend: HTTP API (`pixa-cloud-be/app/api/`)

- **Stack (study BE):** **FastAPI** + Python 3.12, router tại `app/api/v1/endpoints/` (nhiều module `mst_*`, auth, users, …), gom router trong `app/api/v1/api.py`.
- **Luồng:** HTTP → router → **dependency injection** (`app/api/deps.py`: `get_db`, `get_current_user`, role guards) → gọi repository / service.
- **Pattern endpoint thường gặp:** list (filter/sort/pagination), create `POST /`, detail `GET /{id}`, update `PUT /{id}`, soft delete `DELETE /{id}`, bulk delete `DELETE /bulk-delete`, export `GET /export-csv` (khi có).
- **Query chuẩn:** `CommonQueryParams` + JSON `filter`, `sort`, `page`, `per_page` (chi tiết helper filter/sort/pagination ở Layer 4).

### Layer 3 — Backend: validation (`app/schemas/`)

- **Vai trò:** Pydantic **v2** — request/response, đồng bộ với contract FE (Zod) khi đổi field.
- **Quy ước:** schema theo từng domain (`mst_*`, auth, …); giữ message/field errors thống nhất với API response format.

### Layer 4 — Backend: persistence (`app/repositories/` + `app/models/` + PostgreSQL)

- **ORM:** SQLAlchemy **2.x** models trong `app/models/`; **BaseModel**: `id`, **`delete_at` (soft delete)**, audit `created_*` / `updated_*`, `to_dict()` (study BE §4).
- **Repository:** `BaseRepository` và repo con — `get_by_id`, list + pagination, `create` / `update` / **`delete` (soft)**, custom filter trong repo khi filter JSON không đủ (vd. regex trên cột CSV ID).
- **DB:** PostgreSQL 16; **Alembic** migrations (`alembic/`); seed / SQL legacy xem `pixa-cloud-be/README.md`.

### Layer 5 — Backend: cross-cutting (`app/core/`, `app/common/`, `app/exceptions/`)

- **Core:** `config.py` (Settings / `.env`), `database.py` (engine, session), `security.py` (JWT, bcrypt).
- **Common:** helpers **query_filter**, **query_sort**, **query_pagination**, mailer, v.v.; **utils**: logger, **`get_message` / MSI·MSW·MSE**, format response chuẩn.
- **Response JSON (study BE §8):** `status_code`, `message`, `data`, optional `pagination` (`page`, `per_page`, `total_count`, `total_pages`).
- **Auth tokens (study BE):** access (~2h), refresh (~7d), **FORM_LINK** cho public form; roles **ADMIN / OPERATOR / STAFF** map số.
- **Errors:** `APIException`, `LoginError`, `NotFoundError`, `BadRequestError`, `DatabaseError`, …

---

Chi tiết đường dẫn file nhanh: hai bảng **Frontend** / **Backend** bên dưới; mô tả hành vi sâu trong [`docs/guides/frontend-conventions.md`](./docs/guides/frontend-conventions.md) và [`docs/guides/backend-conventions.md`](./docs/guides/backend-conventions.md).

## Directory layout (high level)

```text
PIXA/
├── pixa-cloud-fe/          # React + Vite app (pnpm)
│   ├── client/             # SPA: pages, components, hooks, stores, styles
│   ├── shared/             # TS types shared client-side (and with server bundle if used)
│   ├── server/             # Optional Express (starter); CRM API is pixa-cloud-be
│   └── package.json
├── pixa-cloud-be/          # FastAPI app (Python 3.12)
│   ├── app/
│   │   ├── api/v1/         # Routers: endpoints/*.py, api.py aggregator, deps.py
│   │   ├── schemas/        # Pydantic request/response
│   │   ├── repositories/   # DB access (repository pattern)
│   │   ├── models/         # SQLAlchemy models
│   │   ├── core/           # config, database, security
│   │   └── common/         # helpers (pagination, filter, etc.)
│   ├── tests/
│   ├── alembic/
│   ├── migrations/         # Legacy SQL for Docker init
│   └── README.md           # Detailed BE structure and run instructions
├── docs/
│   ├── guides/             # FE/BE conventions, task workflows, BD authoring
│   ├── dropdown.md         # Dropdown labels + links to FE/BE masters
│   └── DB_DESIGN_new_crm.md
├── .claude/
├── CLAUDE.md               # Short project context (keep aligned with this file)
└── AGENTS.md               # This file
```

## Frontend (`pixa-cloud-fe`) — where to change UI

*(Layer 1 — xem mô tả đầy đủ ở § Layers.)*

| Area | Path | Notes |
|------|------|--------|
| Routes / screens | `client/pages/` | One file per screen; routes in `client/App.tsx` |
| System UI | `client/components/ui/` | Buttons, tables, sidebar, `NotchInput` / `NotchTextarea` in `notch-input.tsx` |
| API hooks | `client/hooks/` | React Query + `api` from `client/lib/api.ts` |
| Global client state | `client/stores/` | Zustand (filters, pagination, auth, etc.) |
| Shared TS contracts | `shared/*.ts` | Imported as `@shared/...` |
| Animations | `client/styles/form-animations.ts` | `FORM_ANIM_STYLES` for admin pages |
| Tests | `client/**/*.test.tsx` | Vitest + Testing Library |

**Commands** (from `pixa-cloud-fe/`): `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm typecheck`.

## Backend (`pixa-cloud-be`) — where to change API

*(Layers 2–5 — xem mô tả đầy đủ ở § Layers.)*

| Area | Path | Notes |
|------|------|--------|
| HTTP routes | `app/api/v1/endpoints/` | Per-resource modules (`mst_*`, `auth`, `users`, …) |
| Wire routers | `app/api/v1/api.py` | Aggregates routers |
| Validation | `app/schemas/` | Pydantic models |
| DB layer | `app/repositories/` | Extends `BaseRepository`; custom filters when needed |
| ORM | `app/models/` | SQLAlchemy; soft delete / audit patterns in `models/base.py` |
| Config | `app/core/config.py` | Settings from env |

**Commands**: see `pixa-cloud-be/README.md` (uvicorn via `run.py`, pytest, docker-compose).

## Cross-cutting rules for agents

1. **Read before writing**: locate existing patterns in the same feature area (e.g. another `mst_*` screen + endpoint).
2. **FE validation**: React Hook Form + Zod; align with BE Pydantic when touching both sides.
3. **Do not assume NestJS** or `src/api` / `src/persistence` at repo root — that layout does not exist here.
4. **Prompts / DoD**: use [`docs/guides/task-workflows-and-dod.md`](./docs/guides/task-workflows-and-dod.md); conventions in [`docs/guides/frontend-conventions.md`](./docs/guides/frontend-conventions.md) and [`docs/guides/backend-conventions.md`](./docs/guides/backend-conventions.md).
5. **Nested git**: `pixa-cloud-fe/` may contain its own `.git`; still treat paths relative to this workspace root when editing in PIXA.

### Verification — KHÔNG được skip

1. **Verify sau mỗi lần sửa code** — chạy `pnpm typecheck` (FE) hoặc `py_compile` (BE) **trước khi** báo "Done". Nếu fail → sửa và verify lại. Không bao giờ coi "ghi file xong" = hoàn thành.
2. **Test phải pass** — chạy `pnpm test` (FE) hoặc `pytest` (BE) cho scope đã sửa. Report kết quả.

### Context & search — tránh miss

1. **File > 500 dòng**: đọc theo chunk (`offset` + `limit`), không dựa vào 1 lần read duy nhất (phần sau bị cắt không báo).
2. **Search không tin 1 lần**: khi refactor/rename, search ít nhất 3 cách (keyword, import path, usage context). Grep miss dynamic import, string reference, re-export — phải kiểm tra thủ công barrel files (`index.ts`), route paths, API paths.
3. **Kết quả search bị truncate**: khi kết quả nhiều, narrow theo folder cụ thể hoặc file type. Không giả định "không tìm thấy" = "không tồn tại".

### Scope & phân chia

1. **Refactor theo phase nhỏ**: ≤ 5 file/phase. Verify + commit mỗi phase trước khi sang phase tiếp.
2. **Task lớn dùng multi-agent**: chia thành agent riêng cho API, UI, validation, test. Mỗi agent nhận đầy đủ file paths + conventions cần thiết.

## Quick “where do I add X?”

- **New CRM admin page**: `client/pages/`, route in `client/App.tsx`, API path in `client/constants/apiPaths.ts`, hook in `client/hooks/`, optional store in `client/stores/`.
- **New REST resource**: `app/api/v1/endpoints/<name>.py`, register in `api.py`, `schemas/`, `repositories/`, `models/` as needed, mirror types in `pixa-cloud-fe/shared/` if shared.
