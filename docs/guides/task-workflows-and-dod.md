# Task workflows & Definition of Done

Tài liệu tham chiếu: [`AGENTS.md`](../../AGENTS.md), [`frontend-conventions.md`](./frontend-conventions.md) (FE), [`backend-conventions.md`](./backend-conventions.md) (BE), [`DB_DESIGN_new_crm.md`](../DB_DESIGN_new_crm.md) (DB). Viết BD (仕様): [`basic-design-authoring.md`](./basic-design-authoring.md).

---

## Biến (khai báo một lần)

Các phần sau chỉ dùng **tên biến**; giá trị gán ở bảng dưới. Khi đổi spec/màn/module.

| Biến | Giá trị |
|------|---------|
| `FE_SCREEN` | `ChannelForm + ChannelSettings` |
| `BE_MODULE` | `mst-channel` |

---

## Chuẩn bị (dùng chung cho mọi luồng bên dưới)

1. **Study** `SPEC_REF` (spec / review).
2. **Study** màn FE `FE_SCREEN` (route, state, API gọi, component hiện tại).
3. **Study** module BE `BE_MODULE` (API, entity, validation server nếu có).
4. **Đối chiếu** [`frontend-conventions.md`](./frontend-conventions.md): **Global state (Zustand)** và **Event hooks** — phân tách trách nhiệm store / form / side-effect (xem mục tương ứng trong file đó).

---

## Quy tắc bổ sung — tránh lặp lỗi (form & list)

Áp dụng khi refactor/code màn form hoặc list; chi tiết pattern nằm trong [`frontend-conventions.md`](./frontend-conventions.md).

1. **`useEffect` reset form (edit / hydrate từ API):** dependency chỉ gồm **giá trị ổn định** cần thiết (`isEdit`, `detail?.id`, từng field primitive dùng để `reset(...)`). Tránh phụ thuộc cả object `detail` nếu reference đổi mỗi lần fetch nhưng dữ liệu không đổi — sẽ gây reset không mong muốn.
2. **Schema có `z.preprocess` / transform (input khác output, ví dụ string → `number`):** khai báo `z.input<typeof schema>` / `z.output<typeof schema>` và dùng `useForm<Input, unknown, Output>`; `defaultValues` phải khớp **kiểu input** (ví dụ `displayOrder: ""` trước khi preprocess ra số nguyên).
3. **Field số nguyên (int) theo BE:** dùng `z.number().int()` (kèm `min`/`max` nếu spec có); nếu ô nhập là text thì `z.preprocess` + coerce, không để validation chỉ là string.
4. **`NotchInput` ô tìm kiếm / keyword:** component có filter mặc định (`hankaku_jp`); nếu spec cho phép đủ loại ký tự (vd. full-width, ký tự đặc biệt), đặt `inputFilter={null}` để khớp hành vi và tránh UT/UX sai.
5. **Unit test (Vitest + jsdom):** nếu gặp `ResizeObserver is not defined`, stub global trong `setupTests` hoặc đầu file test — các component/layout có thể phụ thuộc API này.
6. **Bảng dữ liệu (list/settings):** khi đã dùng table component hệ thống thì dùng đồng bộ `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`; không trộn thẻ native (`table`/`thead`/`tbody`/`tr`/`th`/`td`) trong cùng một bảng.
7. **Textarea trên form:** ưu tiên dùng `NotchTextarea` từ `client/components/ui/notch-input.tsx` (kể cả variant `glass`) thay vì tự tạo textarea wrapper cục bộ (ví dụ `GlassTextarea`) để tránh lệch behavior/label/error style giữa các màn.
8. **Nút action chính (submit/save/register):** dùng `Button` của `client/components/ui/button`; không dùng thẻ `button` native với style/hover thủ công cho action chính để tránh lệch UX và khó đồng bộ test.
9. **Hover/active style cho Button:** dùng CSS (ưu tiên custom properties `--var` + scoped CSS rule/class) thay vì `onMouseEnter`/`onMouseLeave` JS handlers để tránh side-effect UI, giảm flicker và đồng bộ behavior khi test.

---

## Luồng A — Prompt Refactor

**Mục tiêu:** cải thiện chất lượng code và validation, **không** đổi layout UI; **không** bổ sung feature mới ngoài phạm vi refactor.

1. Thực hiện các bước **Chuẩn bị** ở trên.
2. Đối chiếu spec: rà soát validation từng field trên màn `FE_SCREEN`.
3. Quản lý validation bằng **schema** (React Hook Form + Zod / `zodResolver`, thống nhất với pattern trong [`frontend-conventions.md`](./frontend-conventions.md)).
4. Refactor UI để dùng **component UI của hệ thống** (`client/components/ui/`, pattern form đã có), tuân [`frontend-conventions.md`](./frontend-conventions.md).
5. **Giữ nguyên** bố cục / nhìn UI so với trước refactor (chỉ thay implementation bên trong).
6. Viết **unit test** cho màn hình theo mục **Unit testing** trong [`frontend-conventions.md`](./frontend-conventions.md) (Vitest + RTL, mock API, không gọi mạng thật).

---

## Luồng B — Prompt Code

**Mục tiêu:** hoàn thiện chức năng còn thiếu **FE + BE**, sau đó cùng tiêu chí chất lượng như Luồng A.

1. Thực hiện các bước **Chuẩn bị** ở trên.
2. **Code bổ sung** phần còn thiếu trên FE (UX) và BE.
3. Đối chiếu spec: rà soát validation từng field trên màn `FE_SCREEN`.
4. Quản lý validation bằng **schema** (React Hook Form + Zod), đồng bộ rule với BE khi cần.
5. Refactor UI: component hệ thống + [`frontend-conventions.md`](./frontend-conventions.md); **không** đổi layout UI cũ.
6. Viết **unit test** theo [`frontend-conventions.md`](./frontend-conventions.md).

---

## So sánh nhanh

| | Luồng A (Refactor) | Luồng B (Code) |
|--|-------------------|----------------|
| Feature mới FE/BE | Không (chỉ refactor) | Có — bổ sung phần thiếu |
| Validation + schema | Có | Có |
| UI system components | Có | Có |
| Giữ layout | Có | Có |
| UT | Có | Có |

---

## Checklist — Definition of Done

Dùng khi kết thúc task (Luồng A hoặc B). Đánh dấu từng mục khi đã thỏa.

### Chung

- [ ] Đã đối chiếu spec / `SPEC_REF`; hành vi và validation field khớp yêu cầu.
- [ ] Form dùng **React Hook Form + Zod** (`zodResolver`); message lỗi thống nhất, không logic validate rải rác ngoài schema (trừ case bắt buộc tách).
- [ ] Field bắt buộc theo spec/schema phải thể hiện rõ trên UI (set `required` cho input component như `NotchInput`), đồng bộ giữa validation và hiển thị.
- [ ] **State:** UI toàn cục / filter list / wizard không thuộc form field → **Zustand** (`client/stores/`); dữ liệu server → **React Query**; không trùng nguồn sự thật. Side-effect từ UI (điều hướng, toast, analytics) gom vào **hook sự kiện** khi logic lặp hoặc dài — xem [`frontend-conventions.md`](./frontend-conventions.md) (Global state & Event hooks).
- [ ] UI dùng **component hệ thống** và pattern trong [`frontend-conventions.md`](./frontend-conventions.md) (import path, naming, không tự chế primitive khi đã có sẵn).
- [ ] Animation style dùng shared `FORM_ANIM_STYLES` (`client/styles/form-animations.ts`); không tạo `ANIM_STYLES` cục bộ trùng lặp trong từng page.
- [ ] `useEffect` reset/hydrate form: dependency **ổn định** (id + field primitives), không gắn object `detail` cả khối khi chỉ cần so sánh theo giá trị — tránh reset lặp khi parent trả reference mới.
- [ ] Schema Zod có transform/preprocess: `useForm` dùng generic `Input` / `Output`; `defaultValues` đúng **input**; field int trên BE thì `z.number().int()` (preprocess nếu cần).
- [ ] Ô search/keyword trên list: `NotchInput` dùng `inputFilter={null}` khi cần đủ ký tự, không để filter mặc định làm mất nội dung nhập/UT fail.
- [ ] Bảng trên màn list/settings dùng full table primitives của hệ thống (`TableHead`, `TableRow`, `TableCell`...), không trộn thẻ table native trong cùng component.
- [ ] Textarea trên form dùng `NotchTextarea` (không tạo wrapper cục bộ như `GlassTextarea`) để đồng bộ label/error/behavior với system UI.
- [ ] Action button chính trên form/list dùng `Button` system component (không dùng `button` native tự style cho action chính).
- [ ] Hover/active visual của `Button` triển khai bằng CSS (`--custom-properties` + scoped rule/class), không dùng JS handlers `onMouseEnter`/`onMouseLeave`.
- [ ] **Layout / nhìn UI** không đổi so với trước (cùng cấu trúc vùng, spacing tương đương); nếu có khác biệt nhỏ phải được chủ động ghi nhận và chấp nhận.
- [ ] **Unit test** cho màn `FE_SCREEN` (file colocate `*.test.tsx` hoặc theo convention repo): Vitest + RTL, mock `@/lib/api` (hoặc boundary tương đương), **không** gọi mạng thật; cover validation chính (required, format, min/max nếu spec có); stub `ResizeObserver` nếu jsdom báo thiếu.
- [ ] `pnpm test` (hoặc lệnh test của project) **pass** cho phạm vi thay đổi.

### Chỉ Luồng B (Code)

- [ ] Phần **FE/BE còn thiếu** theo spec đã implement và có thể kiểm tra end-to-end hoặc qua API tương ứng.
- [ ] Rule validate **đồng bộ** giữa FE (Zod) và BE khi có validation phía server.

### AI agent verification (bắt buộc khi dùng AI code)

- [ ] **Verify sau mỗi lần sửa**: đã chạy `pnpm typecheck` (FE) / `py_compile` (BE) và **pass** — không tin "Done" của agent khi chưa verify.
- [ ] **Test pass**: đã chạy `pnpm test` (FE) / `pytest` (BE) cho scope thay đổi.
- [ ] **Search đủ trước rename/remove**: đã search ≥ 3 cách (keyword, import path, usage context) — bao gồm barrel files, route paths, string references.
- [ ] **File lớn đã đọc hết**: file > 500 dòng đã đọc theo chunk (offset + limit), không chỉ đọc phần đầu.
- [ ] **Phase nhỏ**: refactor ≤ 5 file/phase, verify mỗi phase.

### Gợi ý trước khi merge

- [ ] Không còn `console.log` / debug tạm.
- [ ] TypeScript / lint sạch trên file đã sửa (theo cấu hình repo).

---

## Phụ lục — Luồng refactor rút gọn (một màn)

Dùng khi chỉ refactor **một** màn, không đổi layout UI. Cùng checklist **Luồng A** phía trên.

| Biến | Giá trị (cập nhật theo task) |
|------|------------------------------|
| `FE_SCREEN` | `CrmSettings.tsx` |

1. **Study** màn FE `FE_SCREEN` (route, state, API, component).
2. Validation **RHF + Zod**; UI **component hệ thống**; **UT** Vitest + RTL, mock API.

---

## Phụ lục — Ví dụ biến task (ticket; không cố định)

Mẫu từ task tính năng lớn (ví dụ S3 / form template); **đổi giá trị** khi áp dụng.

| Biến | Giá trị ví dụ |
|------|----------------|
| `SPEC_REF` | `bd-review-url-setting.md` + `bd-review-form-settings.md` |
| `FE_SCREEN` | `URLFormTemplateForm` + `FormTemplateForm` |
| `BE_MODULE` | `url-form-template` + `form-template` |

1. Study `SPEC_REF`, `FE_SCREEN`, `BE_MODULE`.
2. Nếu spec yêu cầu: cập nhật DB / `DB_DESIGN_new_crm.md` và spec.
3. Code FE + BE; RHF + Zod; đồng bộ rule với [`backend-conventions.md`](./backend-conventions.md).
