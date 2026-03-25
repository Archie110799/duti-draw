# PIXA — Claude project memory

**Mục đích:** ghi lại **kết quả sau khi chạy xong** một phiên “prompt code / refactor” (hoặc quyết định lặp lại), để phiên sau **đọc nhanh** mà không phải đào lại chat.  
**Không thay thế** [`AGENTS.md`](../AGENTS.md) hay [`docs/guides/`](../docs/guides/) — chỉ tóm tắt **theo task / theo thời gian**.

---

## Cách dùng (sau khi prompt code xong)

### Cách 1 — Tự ghi (nhanh nhất)

1. Mở file này: `.claude/memory.md`.
2. Thêm một mục mới **ở trên cùng** (sau đoạn “Cách dùng” hoặc ngay dưới `## Log`), copy **template** bên dưới, điền nội dung.
3. Commit cùng code (nếu team lưu memory trong git).

### Cách 2 — Nhờ agent (trong cùng phiên hoặc phiên sau)

Dán prompt ngắn, ví dụ:

```text
Đọc AGENTS.md và phiên vừa làm. Append vào .claude/memory.md một mục log theo template trong file đó: ngày, FE_SCREEN/BE_MODULE, đã làm, file chính, follow-up. Không trùng nội dung dài đã có trong docs/guides/.
```

Agent sẽ **chỉnh sửa** `.claude/memory.md` (append hoặc prepend mục mới).

### Nên ghi gì / không nên ghi gì

| Nên ghi | Không ghi (để ở doc chuẩn) |
|---------|-----------------------------|
| Biến task: `FE_SCREEN`, `BE_MODULE`, `SPEC_REF` | Toàn bộ convention FE/BE → `docs/guides/*.md` |
| Quyết định kiến trúc **riêng task này** | Definition of Done đầy đủ → `task-workflows-and-dod.md` |
| API path / bảng DB **mới thêm** | Bản đồ monorepo → `AGENTS.md` |
| Gotcha (test fail, flag env, lệnh chạy batch) | Checklist chung prompt → `task-workflows-and-dod.md` |
| Follow-up chưa làm | |

---

## Template (copy cho mỗi lần xong task)

```markdown
### YYYY-MM-DD — <tên task ngắn>

- **Prompt / luồng:** Code | Refactor | BD-only (ghi file prompt hoặc `docs/guides/task-workflows-and-dod.md` §…)
- **FE_SCREEN:** …
- **BE_MODULE:** …
- **SPEC_REF:** … (vd. `docs/RFM.md`)
- **Đã làm:** … (3–7 bullet)
- **File / module chính:** …
- **Test:** `pnpm test …` / `pytest …` (pass | skip lý do)
- **Follow-up:** … | Không
```

---

## Log

<!-- Thêm mục mới nhất phía dưới dòng này (hoặc prepend lên trên section Log — tùy team; giữ một thứ tự thống nhất). -->

### 2026-03-31 — CSV import (perfomancez, jobkan, sendmail, smslink)

- **Prompt / luồng:** Code (`docs/guides/task-workflows-and-dod.md` §Luồng B)
- **BE_MODULE:** `csv-import`
- **SPEC_REF:** `docs/csv/AGENTS.md`
- **CSV_TYPE:** `perfomancez`, `jobkan`, `sendmail`, `smslink` (all 4)
- **Đã làm:**
  - Created `app/services/csv_import/` with 4 service modules (parser + import logic per CSV type)
  - Created endpoint `app/api/v1/endpoints/csv_import.py` with 4 POST endpoints under `/csv-import/`
  - Created schema `app/schemas/csv_import.py` (CsvImportResult)
  - Registered router in `app/api/v1/api.py`
  - Each service: parses CSV, maps to DB tables, logs unmatched rows, commits in batch
  - Defensive `(row.get(...) or "").strip()` for DictReader None handling
- **File / module chính:**
  - `app/services/csv_import/{perfomancez,jobkan,sendmail,smslink}.py`
  - `app/api/v1/endpoints/csv_import.py`
  - `app/schemas/csv_import.py`
  - `app/api/v1/api.py` (router registration)
- **Đã làm (phase 2 — import log + FE):**
  - Created `csv_import_log` table: model, repository, Alembic migration `a1c2e3f4b5d6`
  - Each import endpoint now saves log row (csv_type, file_name, counts, status, user_id)
  - Added `GET /csv-import/` list endpoint with pagination + users join (operator name)
  - FE: `api.upload()` method (multipart/form-data, auto-detect FormData → skip Content-Type)
  - FE: `CsvImport.tsx` fetches real history from API, refreshes after import
  - FE: 4 dropdown options map to 4 CSV type endpoints
- **File / module chính (phase 2):**
  - `app/models/csv_import_log.py`, `app/repositories/csv_import_log_repository.py`
  - `alembic/versions/a1c2e3f4b5d6_add_csv_import_log_table.py`
  - `pixa-cloud-fe/client/lib/api.ts` (upload method, FormData detection)
  - `pixa-cloud-fe/client/constants/apiPaths.ts` (API_CSV_IMPORT.HISTORY)
  - `pixa-cloud-fe/client/pages/CsvImport.tsx`
- **Test:** `pytest tests/test_feature_csv_import_api.py` — 29 passed. Full suite: 101 passed, 4 deselected (integration).
- **Follow-up:**
  - Open point: `mst_mail → dealing_content` join key (using `mail_group_detail_id` as proxy)
  - Open point: `staff_receive.method` numeric values for mail (=3) / sms (=4) — verify with `mst_r_method` data
  - Open point: `project.status` for 案内 (used =1) — verify with `mst_p_status` data
  - Open point: smslink `ID` → maps to `staff.staff_number` — verify mapping rule
  - Open point: jobkan `announce.content` format for edge cases (e.g. `16:30` → `16時半`)
  - Run `alembic upgrade head` on target DB to create `csv_import_log` table
