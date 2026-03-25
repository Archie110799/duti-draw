# Contributing to PIXA

Tài liệu này hướng dẫn **setup local** và **luồng làm việc** trên monorepo PIXA (CRM). Bản đồ chi tiết cho dev và coding agents: [`AGENTS.md`](./AGENTS.md).

## Kiến trúc ngắn gọn

| Thư mục | Vai trò |
|--------|---------|
| `pixa-cloud-be/` | API **FastAPI** — nguồn dữ liệu chính cho CRM |
| `pixa-cloud-fe/` | SPA **React + Vite** — gọi API qua `client/lib/api.ts` |
| `docs/` | Thiết kế DB, tài liệu bổ sung |
| [`.claude/`](./.claude/) | Claude Code: [settings](.claude/settings.json), [hooks](.claude/hooks/pre-commit.md), [skills](.claude/skills/code-review/SKILL.md) (code-review / refactor / release) |

FE mặc định trỏ API tới `http://localhost:8000/api/v1` (xem `VITE_API_BASE` trong `pixa-cloud-fe/client/constants/apiPaths.ts`).

## Yêu cầu môi trường

- **Node.js** LTS (khuyến nghị 20+) và **pnpm**
- **Python 3.12+**
- **PostgreSQL 16+** hoặc **Docker** (cho BE và migration)

## Backend (`pixa-cloud-be`)

Chi tiết đầy đủ: [`pixa-cloud-be/README.md`](./pixa-cloud-be/README.md).

### Lệnh tối thiểu

```bash
cd pixa-cloud-be
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.sample .env                # chỉnh DATABASE_URL và biến cần thiết
```

Khởi động DB (Docker, tùy chọn):

```bash
docker compose -f docker-compose.db.yml up -d
```

Migration và chạy API:

```bash
alembic upgrade head
python3 run.py
```

- API: thường **http://localhost:8000**
- OpenAPI: **http://localhost:8000/docs**

### Test & chất lượng (BE)

```bash
pip install -r requirements-dev.txt   # lần đầu
python -m pytest -m "not integration" -q   # unit, không cần DB
ruff format .
ruff check . --fix
```

## Frontend (`pixa-cloud-fe`)

### Lệnh tối thiểu

```bash
cd pixa-cloud-fe
pnpm install
pnpm dev
```

- Dev server Vite: **http://localhost:8081** (theo `vite.config.ts`)

### API base URL

Nếu BE chạy host/port khác, đặt biến môi trường khi chạy Vite (ví dụ file `.env.local` trong `pixa-cloud-fe`):

```bash
VITE_API_BASE=http://localhost:8000/api/v1
```

### Test & chất lượng (FE)

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Claude Code — thư mục [`.claude/`](./.claude/)

Dùng khi làm việc với **Claude Code** trong repo (skills, hooks, settings):

- [`.claude/settings.json`](./.claude/settings.json)
- [`.claude/hooks/pre-commit.md`](./.claude/hooks/pre-commit.md)
- [`.claude/skills/code-review/SKILL.md`](./.claude/skills/code-review/SKILL.md)
- [`.claude/skills/refactor/SKILL.md`](./.claude/skills/refactor/SKILL.md)
- [`.claude/skills/release/SKILL.md`](./.claude/skills/release/SKILL.md)
- [`.claude/memory.md`](./.claude/memory.md) — sau khi xong một task prompt code: append log theo template trong file

Bản đồ tổng thể và ngữ cảnh agent: [`AGENTS.md`](./AGENTS.md).

## Quy ước code & tài liệu

- **Mục lục:** [`docs/guides/README.md`](./docs/guides/README.md)
- **FE:** [`docs/guides/frontend-conventions.md`](./docs/guides/frontend-conventions.md)
- **BE:** [`docs/guides/backend-conventions.md`](./docs/guides/backend-conventions.md)
- **Task / DoD / BD:** [`docs/guides/task-workflows-and-dod.md`](./docs/guides/task-workflows-and-dod.md), [`docs/guides/basic-design-authoring.md`](./docs/guides/basic-design-authoring.md)
- **DB:** [`docs/DB_DESIGN_new_crm.md`](./docs/DB_DESIGN_new_crm.md)

## Luồng đề xuất khi sửa một tính năng CRM

1. Đọc [`AGENTS.md`](./AGENTS.md) để xác định đúng package và thư mục.
2. Tìm màn / endpoint **tương tự** (ví dụ module `mst_*`) và bắt chước pattern.
3. Đồng bộ validation **FE (Zod)** với **BE (Pydantic)** khi thêm/sửa field.
4. Chạy test/lint trong phạm vi thư mục đã sửa (`pnpm test …` hoặc `pytest …`).

## Ghi chú

- Thư mục `pixa-cloud-fe/server/` là phần **Express** kèm template; API CRM chính nằm ở **`pixa-cloud-be`**. Chỉ mở rộng Express khi có lý do rõ (proxy, asset đặc thù, v.v.).
- `pixa-cloud-fe/` có thể có repository Git riêng; khi clone chỉ FE, hãy đặt cạnh `pixa-cloud-be` và cấu hình `VITE_API_BASE` cho khớp môi trường.
