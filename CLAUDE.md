# Claude / Cursor — PIXA workspace

## Overview

Monorepo for **PIXA CRM**: React SPA + FastAPI backend + PostgreSQL.

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | `pixa-cloud-fe/` — React 18, Vite, TypeScript, Tailwind, React Router, Zustand, React Query, Zod, Vitest |
| Backend | `pixa-cloud-be/` — Python 3.12, FastAPI, SQLAlchemy 2, Pydantic 2, PostgreSQL, Alembic |
| DB docs | `docs/DB_DESIGN_new_crm.md` |

## Layout (correct paths)

- **FE app**: `pixa-cloud-fe/client/` (pages, components, hooks, stores, lib, styles)
- **FE ↔ API**: `pixa-cloud-fe/client/lib/api.ts`, `pixa-cloud-fe/client/constants/apiPaths.ts`
- **BE API**: `pixa-cloud-be/app/api/v1/endpoints/`, schemas in `app/schemas/`, DB in `app/repositories/` + `app/models/`

## AI guidelines

- Read **`AGENTS.md`** at repo root for the full map and “where to add X”.
- For **local setup** (venv, pnpm, env vars, ports): **`CONTRIBUTING.md`**.
- **Claude Code** project files: **[`.claude/`](.claude/)** — [settings](.claude/settings.json), [pre-commit hook doc](.claude/hooks/pre-commit.md), skills [code-review](.claude/skills/code-review/SKILL.md) · [refactor](.claude/skills/refactor/SKILL.md) · [release](.claude/skills/release/SKILL.md).
- Follow **`docs/guides/frontend-conventions.md`**, **`docs/guides/backend-conventions.md`**, and **`docs/guides/task-workflows-and-dod.md`** for conventions and task checklists.
- Prefer existing patterns in the same feature area (e.g. other `mst_*` modules) before inventing new structure.
- Do not assume **NestJS** or root-level `src/api` / `src/persistence` — this repo uses **FastAPI** under `pixa-cloud-be/app/`.

## Commands

- Frontend (from `pixa-cloud-fe/`): `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm typecheck`
- Backend: see `pixa-cloud-be/README.md` (uvicorn, pytest, docker-compose)

## AI guardrails — tránh lỗi phổ biến khi dùng AI agent

### 1. Verify sau mỗi lần sửa code (KHÔNG tin "Done")

AI agent coi "ghi file xong" = hoàn thành. **Luôn chạy verify sau khi sửa**:

- **FE:** `cd pixa-cloud-fe && pnpm typecheck && pnpm test` (tối thiểu `pnpm typecheck`)
- **BE:** `cd pixa-cloud-be && python -m py_compile app/...` hoặc `pytest`
- Nếu verify fail → sửa và verify lại cho đến khi pass

### 2. Giảm context trước khi làm task lớn

Sau ~15 message, context bị nén → agent "quên" code cũ. Để giảm thiểu:

- Xóa dead code / file không liên quan trước khi bắt đầu
- Mỗi phase refactor **≤ 5 file** — commit xong rồi mới sang phase tiếp
- Khi context dài: tóm tắt trạng thái hiện tại trước khi tiếp tục

### 3. Yêu cầu chất lượng rõ ràng

Agent mặc định làm cách đơn giản nhất. Khi cần chất lượng cao, ghi rõ:

- "Refactor theo chuẩn senior engineer"
- "Ưu tiên clean code, maintainable, follow conventions trong `docs/guides/`"
- "Tách component/hook theo single responsibility"

### 4. Multi-agent cho task lớn

1 agent = ~167K tokens context. Task lớn nên chia:

- Agent riêng cho: API, UI components, validation/schema, tests, refactor
- Dùng `Agent` tool với `subagent_type` phù hợp
- Mỗi agent nhận đủ context cần thiết (file paths, conventions)

### 5. File lớn: đọc theo section

Tool Read giới hạn ~2000 dòng/lần, phần còn lại bị cắt **không báo**:

- File > 500 dòng: đọc theo `offset` + `limit` (ví dụ `offset: 0, limit: 500`, rồi `offset: 500, limit: 500`)
- Hoặc dùng Grep tìm đúng section cần đọc trước

### 6. Search: không tin 1 lần duy nhất

Kết quả search bị truncate → miss logic quan trọng:

- Search theo **folder cụ thể** thay vì toàn repo
- Narrow query khi kết quả quá nhiều
- Khi refactor/rename: search ít nhất 3 cách — keyword, import path, usage context

### 7. Grep không hiểu dynamic code

`grep` sẽ miss: dynamic import, string-based reference, re-export, computed property. Khi rename/refactor:

- Search cả tên function, tên file, path import
- Kiểm tra re-export (`index.ts`, barrel files)
- Kiểm tra string references (route paths, API paths, test mocks)
