# Skill: Code Review

## Goal
Review code for quality and best practices

## Input
- Source code

## Output
- Issues
- Suggestions
- Refactored version (if needed)

## Rules
- Check naming conventions
- Check performance issues
- Avoid duplicate logic
- Follow conventions in `docs/guides/frontend-conventions.md` / `docs/guides/backend-conventions.md`

## Review checklist — tránh miss

1. **Đọc đủ file** — file > 500 dòng phải đọc theo chunk; không review dựa trên phần đầu file rồi giả định phần còn lại OK
2. **Search usage đầy đủ** — khi đánh giá "unused code", search ít nhất 3 cách (keyword, import, string reference). Grep miss dynamic import và re-export
3. **Verify suggestions** — nếu đề xuất rename/remove, chạy search xác nhận không có usage ẩn
4. **Kiểm tra barrel files** — `index.ts` re-export có thể ẩn dependency; route paths và API paths có thể reference bằng string
