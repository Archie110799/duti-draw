# Backend conventions (PIXA CRM)

Tài liệu chi tiết cho `pixa-cloud-be/`. Bản đồ monorepo: [`AGENTS.md`](../../AGENTS.md). FE patterns: [`frontend-conventions.md`](./frontend-conventions.md).

## 0. Monorepo context

- **Workspace map (humans + AI agents):** [`AGENTS.md`](../../AGENTS.md) at the PIXA monorepo root — includes **§ Layers**. **Claude Code:** [`.claude/`](../../.claude/). **Task workflows:** [`task-workflows-and-dod.md`](./task-workflows-and-dod.md).

## 1. Project Overview

- **Framework**: FastAPI 0.128.0 + Python 3.12
- **Database**: PostgreSQL 16 + SQLAlchemy 2.0.45
- **Migrations**: Alembic 1.18.1
- **Validation**: Pydantic 2.12.5
- **Auth**: JWT (python-jose) + bcrypt
- **Integration**: LINE Bot SDK 3.21.0

## 2. Project Structure

```
pixa-cloud-be/
├── app/
│   ├── main.py                  # FastAPI entry, middleware, exception handlers
│   ├── api/
│   │   ├── deps.py              # Auth dependencies (get_current_user, roles_required)
│   │   └── v1/
│   │       ├── api.py           # Router aggregator (53 endpoint modules)
│   │       └── endpoints/       # 53 endpoint modules
│   ├── core/
│   │   ├── config.py            # Pydantic Settings (loads .env)
│   │   ├── database.py          # SQLAlchemy engine, SessionLocal, Base
│   │   └── security.py          # JWT creation, password hashing (bcrypt)
│   ├── models/                  # 61 SQLAlchemy models
│   │   ├── base.py              # BaseModel (id, delete_at, created/updated audit)
│   │   └── __init__.py          # Model registry
│   ├── schemas/                 # 57 Pydantic request/response schemas
│   ├── repositories/            # 54 repository classes
│   │   └── base_repository.py   # Generic CRUD (get, create, update, soft-delete)
│   ├── exceptions/              # APIException, LoginError, NotFoundError, etc.
│   └── common/
│       ├── helpers/             # query_filter, query_sort, query_pagination, mailer
│       └── utils/               # logger, messages, response formatting, constants
├── alembic/                     # DB migrations (5 migration files)
├── seeders/                     # Data seeding
├── requirements.txt
├── requirements-dev.txt         # pytest, httpx (tests)
├── pytest.ini
├── tests/                       # pytest: unit + integration/
├── pyproject.toml               # Ruff linter config
├── run.py                       # Entry point
└── docker-compose.yml
```

## 3. Architecture Pattern

```
HTTP Request
  → FastAPI Router (endpoints/)
  → Dependency Injection (deps.py: auth, db session)
  → Pydantic Schema (validation)
  → Repository Layer (repositories/)
  → SQLAlchemy Model (models/)
  → PostgreSQL
```

## 4. Base Model (all models inherit)

```python
class BaseModel(Base):
    id         = BigInteger, PK, autoincrement
    delete_at  = DateTime (nullable)  # soft delete
    created_by = BigInteger           # user who created
    created_at = DateTime (UTC)
    updated_by = BigInteger
    updated_at = DateTime (UTC, auto-updated)

    def to_dict() -> dict
```

## 5. Standard CRUD Endpoint Pattern

```python
@router.get("/")        # List with filter/sort/pagination
@router.post("/")       # Create (201)
@router.get("/{id}")    # Get detail
@router.put("/{id}")    # Update
@router.delete("/{id}") # Soft delete
@router.delete("/bulk-delete")  # Bulk soft delete
@router.get("/export-csv")     # CSV export
```

All endpoints use:
- `Depends(get_db)` for DB session
- `Depends(get_current_user)` for auth
- `CommonQueryParams` for filter/sort/page

## 6. Query Helpers

**Filter** (`filter={"status": 1, "name": "john"}`):
- `None` → `IS NULL`
- `"not_null"` → `IS NOT NULL`
- `[1,2,3]` → `IN (...)`
- String → `ILIKE %value%`
- Other → exact match

**Sort** (`sort="id:desc,name:asc"`): Comma-separated field:direction

**Pagination** (`page=1&per_page=20`): 1-indexed, offset = (page-1) * per_page

## 7. Authentication

**JWT Tokens:**
- ACCESS: 2-hour validity, for API calls
- REFRESH: 7-day validity, for token renewal
- FORM_LINK: Self-contained (public form submission, no session check)

**Roles:** ADMIN (1), OPERATOR (2), STAFF (3)

**Login flow:** POST /auth/login → validate credentials → create tokens → save LoginSession

## 8. API Response Format

```json
{
  "status_code": 200,
  "message": "登録完了。",
  "data": { ... },
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_count": 100,
    "total_pages": 10
  }
}
```

## 9. Message Code System

- `MSI` prefix: Info/success (MSI00001=登録完了, MSI00002=更新完了, MSI00003=削除完了)
- `MSW` prefix: Warning
- `MSE` prefix: Error (MSE00001=ID/PW incorrect, MSE00082=Not found)
- Parameterized: `get_message("MSE00026", row="3", msg="スタッフ番号が空欄です。")`

## 10. Key Models (Form-related)

### form_template
- id, name, dealing_content_id (FK), project_id, major_type_id, minor_type_id
- purpose, display_order, display_flag
- UNIQUE(dealing_content_id, project_id, major_type_id, minor_type_id)

### mst_form_field
- id, form_template_id (FK), field_key, field_name, field_type
- description, required_flag, display_order, display_flag
- placeholder, options_json (JSON array for choices)
- parent_field_id (FK self, branching), trigger_value, correct_answer

### form_result
- id, report_id (FK, nullable), field_key, field_value
- staff_receive_id (FK)

### Other form types:
- contact_form_template + mst_contact_form_field + contact_form_result
- url_form_template + mst_url_form_field

## 11. Form Submission Flow

```
1. Decode FORM_LINK JWT → extract form_id, staff_id
2. Create StaffReceive record (method=8, status=1)
3. Create Report record (if review/report type)
4. For each answer: create FormResult (field_key, field_value)
5. Commit transaction
```

## 12. Repository Pattern

```python
class BaseRepository:
    get_one(**kwargs)                         # First matching
    get_by_id(id)                             # By PK (soft-delete aware)
    get_multi_with_pagination(params)         # List + pagination
    create(obj_in)                            # Insert + commit
    update(db_obj, obj_in)                    # Update fields + commit
    delete(id)                                # Soft delete (set delete_at)
```

## 13. Error Handling

```python
APIException(message, status_code)  # Base
LoginError     → 401
NotFoundError  → 404
BadRequestError → 400
DatabaseError  → 500
```

Centralized handler converts exceptions to standard JSON response.

## 14. Key Commands

```bash
# Dev
python3 run.py                          # Start server (port 8000)
alembic upgrade head                    # Apply migrations
alembic revision --autogenerate -m "x"  # Create migration

# Docker
docker compose -f docker-compose.db.yml up -d  # DB only
docker compose up -d                            # Full stack

# Quality
ruff format . && ruff check . --fix

# Tests (UT — không cần DB; xem §15)
cd pixa-cloud-be && python -m pytest -m "not integration" -q
```

## 15. Testing (pytest) — rules & chạy UT

Chi tiết đầy đủ: `pixa-cloud-be/README.md` → mục **Chạy test (pytest)**.

### 15.1 Cấu trúc thư mục

| Path | Mục đích |
|------|----------|
| `pixa-cloud-be/tests/*.py` | Unit test (helpers, smoke, **feature API** với mock) |
| `pixa-cloud-be/tests/integration/` | Integration test PostgreSQL (marker `pytest.mark.integration`) |
| `pixa-cloud-be/tests/conftest.py` | Fixture dùng chung: `client`, `client_mock_db`, `client_authed_db`, `FakeAuthUser` |
| `pixa-cloud-be/pytest.ini` | `testpaths`, `pythonpath`, marker `integration` |

### 15.2 Quy tắc code Repository — reusable filter condition

Khi một tập điều kiện WHERE/JOIN lặp lại nhiều lần trong cùng method (hoặc cùng class), **tách thành biến `and_(…)`** rồi tái sử dụng thay vì copy-paste.

```python
from sqlalchemy import and_

# Define once
staff_receive_filter = and_(
    StaffReceive.delete_at.is_(None),
    StaffReceive.type == 2,
    StaffReceive.insert_at >= bd_start,
    StaffReceive.insert_at <= bd_end,
)

# Reuse in .filter()
base = db.query(StaffReceive).filter(
    staff_receive_filter,
    StaffReceive.dealing_content_id.in_(ids),
)

# Reuse in .outerjoin() ON clause
q = db.query(...).outerjoin(
    StaffReceive,
    (StaffReceive.dealing_content_id == MstDealingContent.id)
    & staff_receive_filter,
)
```

**Lợi ích:**
- Sửa điều kiện 1 chỗ → áp dụng mọi nơi, tránh lệch logic giữa `base` query và JOIN.
- Code ngắn hơn, dễ review hơn.
- `and_()` trả về một `ClauseElement`, dùng được trong cả `.filter()` lẫn `&` (JOIN ON).

### 15.3 Quy tắc code UT (feature endpoint)

1. **Không cần PostgreSQL / Docker** cho UT thường: mock `Repository` + `Session` (MagicMock).
2. **Patch đúng chỗ import** trong module endpoint, ví dụ:
   - `@patch("app.api.v1.endpoints.mst_major_type.MstMajorTypeRepository")`
   - `@patch("app.api.v1.endpoints.auth.UserRepository")` (cùng pattern cho `LoginSessionRepository`, `security.verify_password`, …).
3. **Override FastAPI dependencies** (qua fixture đã có):
   - API cần đăng nhập → `client_authed_db` (mock `get_db` + `get_current_user` = `FakeAuthUser`, không cần JWT thật).
   - Chỉ cần `Session` (vd. `POST /auth/login`) → `client_mock_db`.
4. **URL gọi**: prefix `/api/v1` + `prefix` trong `app/api/v1/api.py` (vd. `/api/v1/mst-major-type/`, `/api/v1/contact/`).
5. **Repository mock**: set `get_multi_with_pagination.return_value = ([dict_rows], pagination_dict)` hoặc `get_by_id` / `get_one`/`get_one_by_id_with_filter` tùy endpoint.
6. Nếu endpoint gọi thêm **`db.query(...)`** (vd. `mst_minor_type` `/options`), mock `mock_db.query.return_value.all.return_value` trên fixture `client_authed_db`.
7. Đặt tên file gợi ý: `test_feature_<area>_api.py`; integration: `tests/integration/test_*.py` + `pytestmark = pytest.mark.integration`.

### 15.4 Chạy unit test (không cần DB)

```bash
cd pixa-cloud-be
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt

# Chỉ UT (không chạy integration đã collect)
python -m pytest -m "not integration" -q

# Một file / pattern
python -m pytest tests/test_health.py -q
python -m pytest -k "major_type" -q
```

### 15.5 Chạy integration (PostgreSQL + schema)

- Cần `TEST_DATABASE_URL` (vd. `postgresql+psycopg2://user:pass@host:port/db`).
- `alembic upgrade head` trên DB đó (xem README: `DATABASE_URL=... alembic upgrade head`).
- Tùy chọn: `docker compose -f docker-compose.test.yml up -d` + `.env.test.sample`.

```bash
export TEST_DATABASE_URL="postgresql+psycopg2://..."
python -m pytest -m integration -v
```

`pytest` **không** set `TEST_DATABASE_URL`: các test integration **skip** (`s`), UT vẫn chạy.

### 15.6 Flags hữu ích

| Flag / biến | Ý nghĩa |
|---------------|---------|
| `-q` / `-v` | Gọn / chi tiết |
| `-k "pattern"` | Lọc theo tên test |
| `--tb=short` | Traceback ngắn |
| `TEST_DATABASE_URL` | Bật integration (không có → skip) |

**Ví dụ file UT feature (mock repository):** `test_feature_mst_major_type_api.py`, `test_feature_mst_minor_type_api.py`, `test_feature_mst_type_api.py`, `test_feature_contact_api.py`, `test_feature_announce_api.py`, `test_feature_form_template_api.py`, `test_feature_url_form_template_api.py`, `test_feature_kpi_target_api.py`, `test_feature_auth_login.py`.

## 16. Key Stats

| Category | Count |
|----------|-------|
| Models | 61 |
| Repositories | 54 |
| Endpoint modules | 53 |
| Schema files | 57 |
| Total routes | 200+ |
| Master data tables | 30+ |
| Migration files | 5 |

## 17. pixa-cloud-fe — tổng quan (cùng monorepo PIXA)

Frontend nằm trong `pixa-cloud-fe/`; gọi API FastAPI (`pixa-cloud-be`) qua HTTP (path thường định nghĩa trong `client/constants/apiPaths.ts`, BFF/Express trong `server/routes/`).

| Thành phần | Ghi chú |
|------------|---------|
| **Build** | Vite (`vite.config.ts`), `npm run dev` / `npm run build` |
| **UI** | React + TypeScript, Radix UI, Tailwind (theo `package.json`) |
| **State** | Zustand (`client/stores/`) |
| **SSR / API proxy** | Express 5 (`server/index.ts`, `server/routes/*.ts`) |
| **Test FE** | Vitest: `npm test` (`vitest --run`) — **không** thay thế UT Python của BE |

Quy tắc khi đổi **cùng một nghiệp vụ** BE + FE: cập nhật schema/endpoint BE → chỉnh hook/page FE → thêm/cập nhật **UT BE** theo §15 (mock repository), và test FE (Vitest) nếu có component/store liên quan.
