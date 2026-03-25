# Skill: Refactor

## Goal
Improve code structure without changing behavior

## Rules
- Keep logic unchanged
- Improve readability
- Reduce complexity
- Follow patterns in `docs/guides/frontend-conventions.md` / `docs/guides/backend-conventions.md`
- Prefer existing patterns in the same feature area before inventing new structure

## Process

1. **Read fully** — file > 500 dòng phải đọc theo chunk (offset + limit); không dựa vào 1 lần read
2. **Search thoroughly** — trước khi rename/move, search ít nhất 3 cách: keyword, import path, usage context. Kiểm tra barrel files (`index.ts`), route paths, API paths, string references
3. **Phase nhỏ** — refactor ≤ 5 file/phase; verify mỗi phase trước khi tiếp
4. **Verify bắt buộc** — sau mỗi lần sửa:
   - FE: `cd pixa-cloud-fe && pnpm typecheck` (tối thiểu), `pnpm test` (nếu có test)
   - BE: `cd pixa-cloud-be && python -m py_compile <file>` hoặc `pytest`
   - Nếu fail → sửa và verify lại. KHÔNG báo "Done" khi chưa pass

## Output
- Cleaner version of code
- Verification result (typecheck / test pass)
