# Frontend conventions (PIXA CRM)

Tài liệu chi tiết cho `pixa-cloud-fe/`. Bản đồ monorepo và tóm tắt layer: [`AGENTS.md`](../../AGENTS.md).

## 0. Monorepo context

- **Workspace map (humans + AI agents):** [`AGENTS.md`](../../AGENTS.md) at the PIXA monorepo root — includes **§ Layers** (tóm tắt FE/BE). **Claude Code:** [`.claude/`](../../.claude/). **Task workflows / DoD:** [`task-workflows-and-dod.md`](./task-workflows-and-dod.md).
- **CRM API in production:** `pixa-cloud-be/` (FastAPI). The SPA calls it via `client/lib/api.ts` and `client/constants/apiPaths.ts`.
- **`server/` Express** in this package is mainly from the fusion-starter template (mock / ancillary). Do not assume new CRM REST endpoints belong there unless you are explicitly extending that server.

## 1. Project Structure

```
pixa-cloud-fe/
├── client/                    # React SPA frontend
│   ├── App.tsx                # Main routing (React Router v6, 80+ routes)
│   ├── global.css             # Design tokens, animations, Tailwind directives
│   ├── pages/                 # 80+ page components
│   ├── components/
│   │   ├── ui/                # shadcn/ui (Radix) + app-specific UI (kebab-case files)
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── form-template/     # Form field rendering components
│   │   └── inquiry/           # Inquiry feature components
│   ├── hooks/                 # React Query API hooks + orchestrators / event hooks (use*Events, use*FormPage)
│   ├── stores/                # Zustand global & page-level stores (auth, staffSearch, listCreate, *Settings)
│   ├── contexts/              # React context providers
│   ├── constants/             # Config (routePaths, apiPaths, authRoles)
│   ├── lib/                   # Utilities (api.ts, utils.ts, loginThrottle.ts)
│   └── types/                 # TypeScript type definitions
├── server/                    # Express backend (mock API)
│   ├── index.ts               # Express app factory
│   ├── node-build.ts          # Production entry
│   └── routes/                # Mock route handlers
│       ├── mail-templates.ts
│       ├── mail-groups.ts
│       ├── form-templates.ts
│       └── url-form-templates.ts
├── shared/                    # Shared types (client + server)
│   ├── form-template.ts
│   ├── url-form-template.ts
│   ├── mail-template.ts
│   └── api.ts
├── static/                    # Static HTML/JS assets
├── tailwind.config.ts
├── vite.config.ts             # Dev server (port 8081) + Vitest (`test` block)
├── client/test/setup.ts       # Vitest: jest-dom matchers, global test setup
├── tsconfig.json
├── components.json            # shadcn/ui config
└── package.json
```

## 2. Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| UI Framework | React | 18.3.1 |
| Routing | React Router | 6.30.1 |
| Language | TypeScript | 5.9.2 |
| Styling | Tailwind CSS | 3.4.17 |
| Form Handling | React Hook Form + Zod | 7.62.0 / 3.25.76 |
| Server State | TanStack React Query | 5.84.2 |
| Client State | Zustand | 5.0.11 |
| UI Primitives | Radix UI | latest |
| Icons | Lucide React | 0.539.0 |
| Toasts | Sonner | 1.7.4 |
| Animations | Framer Motion | 12.23.12 |
| Charts | Recharts | 2.12.7 |
| Backend | Express | 5.1.0 |
| Bundler | Vite | 7.1.2 |
| Unit tests | Vitest + Testing Library + jsdom | 3.2.x / 16.x |

## 3. Routing & Auth

- **ProtectedRoute** — requires auth token
- **CrmRoute** — LEVEL1 users only (CRM settings)
- Public routes: `/login`, `/form-view`
- User roles: LEVEL1 (admin), LEVEL2, LEVEL3
- Login throttle: 5 attempts then 60s lockout
- Auth stored in Zustand: accessToken, refreshToken, user

## 4. Styling System

**Color variables (HSL in global.css):**
- Primary: `17 90% 40%` (orange #F97316)
- Brand: `--pixa-orange`, `--pixa-orange-dark/light/lighter`
- System: primary, secondary, destructive, muted, accent
- Font: Noto Sans JP + Noto Sans (Google Fonts)
- Dark mode: class-based (ready)

**Design patterns:**
- Neumorphic cards, glassmorphism, orange gradients
- `cn()` = clsx + tailwind-merge for conditional classes
- CVA (class-variance-authority) for button variants

## 4b. Mail template form refactor

- **Doc:** [`task-workflows-and-dod.md`](./task-workflows-and-dod.md) (luồng refactor) — schema tách cho「読込」block, hook `useMailTemplateFormPage`, helpers `client/lib/mailGroupOptions.ts`, Vitest cho schema/helpers.

## 5. Component System (`components/ui/`)

**Naming:** shadcn primitives and app UI live in **`components/ui/`** with **kebab-case** filenames (e.g. `button.tsx`, `date-picker.tsx`, `app-sidebar.tsx`).

**shadcn / Radix (50+ files):**
- Layout: Card, Dialog, Drawer, Sheet, Tabs, Accordion, `sidebar.tsx` (SidebarProvider primitives)
- Form: Input, Textarea, Select, Checkbox, RadioGroup, Label, Form
- Data: Table, Badge, Progress, Pagination, Skeleton
- Feedback: Alert, Toast/Sonner, Tooltip, Popover
- Navigation: Button, DropdownMenu, Breadcrumb

**App-specific UI (same folder, kebab-case):**

| File | Role |
|------|------|
| `header.tsx` | Top navigation bar (page title, user menu) |
| `app-sidebar.tsx` | Main CRM left nav (orange gradient). **Not** the shadcn `sidebar.tsx` primitives. |
| `custom-select.tsx` | Styled dropdown (notch / plain / inline), multi-select |
| `date-picker.tsx` | Calendar popup (Japanese locale) |
| `time-picker.tsx` | Hour/minute selector |
| `notch-input.tsx` | Floating-label input / textarea |
| `no-data.tsx` | Empty-state placeholder |
| `staff-nav-buttons.tsx` | Staff sub-nav buttons |
| `staff-info-panel.tsx` | Staff info panels (A/B variants) |
| `staff-profile-summary.tsx` | Profile summary + expand + StaffInfoPanelB |
| `table-scroll-buttons.tsx` | Horizontal scroll overlay for wide tables. Wrap `<div className="overflow-x-auto">…</div>` with `<TableScrollButtons>`. Auto-detects the scrollable child, shows/hides orange-gradient left/right buttons. |
| `pagination-footer.tsx` | Shared pagination bar (info text + first/prev/pages/next/last). Props: `currentPage`, `totalPages`, `totalCount`, `perPage`, `onPageChange`. |
| `status-chip.tsx` | Colored pill for table status values. Props: `label`, `bg`, `text`, `colorMap`. Export `StatusChipColorMap` type for page-level color maps. |
| `rich-text-field.tsx`, `expandable-panel.tsx`, `inquiry-icons.tsx` | Form / inquiry helpers |

**Imports:** `@/components/ui/<file-without-ext>` — e.g. `import Header from "@/components/ui/header"`, `import Sidebar from "@/components/ui/app-sidebar"`.

## 6. API Layer

**Client wrapper (`lib/api.ts`):**
```typescript
api.get<T>(url)  / api.post<T>(url, body)  / api.put / api.delete
// Base: VITE_API_BASE ?? "http://localhost:8000/api/v1"
// Auto-injects Authorization: Bearer {token}
// Throws ApiError with status + messageId
```

**React-Query patterns:**
```typescript
const KEYS = { templates: "form-templates", detail: "form-template-detail" };
// List: useQuery({ queryKey: [KEYS.templates, params], queryFn })
// Mutation: useMutation({ mutationFn, onSuccess: invalidateQueries })
```

**Hooks:** useStaffApi, useMailTemplateApi, useFormTemplateApi, useUrlFormTemplateApi, useBriefingApi, useMailGroupApi

## 7. Server (Express Mock)

- In-memory mock data, no real database
- Soft delete (deleted flag), auto-increment IDs
- Hardcoded master data (major types, minor types, projects)
- Routes: `/api/v1/mst-mail`, `/api/v1/form-template`, `/api/v1/url-form-templates`

## 8. Common Page Patterns

```tsx
export default function PageName() {
  // Server: react-query (useQuery / useMutation)
  // Global UI: Zustand store when filters/selection cross components
  // Events: custom hook (useXxxEvents) for navigate/toast/mutation orchestration
  const { data } = useQuery();
  const mutation = useMutation();
  // Render: <Sidebar/> + <Header/> + <main> (filters + table/form + actions)
}
```

- Form: Zod schema + useForm() + FormField + useMutation + toast
- Table: pagination + checkbox select + bulk actions + sortable columns
  - Use shadcn **`TableHeader`**, **`TableBody`**, **`TableHead`**, **`TableRow`**, **`TableCell`** from `@/components/ui/table` — do **not** use raw `<table>/<thead>/<tbody>/<tr>/<th>/<td>`.
  - Wide tables: wrap with **`<TableScrollButtons>`** (`@/components/ui/table-scroll-buttons`) — do **not** reimplement scroll ref/buttons inline.
  - Pagination: use **`<PaginationFooter>`** (`@/components/ui/pagination-footer`) — do **not** duplicate inline page-number logic.
  - Date/time formatting: use **`formatDate(value, pattern)`** from `@/lib/formatDate` with constants from `@/constants/common` (e.g. `DATE_TIME_FORMAT_YMD_HMS` → `"yyyy/MM/dd HH:mm:ss"`) — do **not** write inline date-format functions.
- Settings pages: neumorphic cards, animated backgrounds

## 9. Build & Dev

```bash
pnpm dev          # Vite + Express (port 8081)
pnpm build        # Client (dist/spa) + Server (dist/server)
pnpm start        # node dist/server/node-build.mjs
pnpm test         # Vitest (single run)
pnpm exec vitest  # watch mode (no --run)
pnpm typecheck    # tsc --noEmit
```

Path aliases: `@/` = client/, `@shared/` = shared/

## 10. Coding Rules

### State Management — tổng quan

| Trách nhiệm | Công cụ | Ghi chú |
|-------------|---------|---------|
| Dữ liệu từ API (cache, refetch) | **TanStack React Query** | `useQuery` / `useMutation`; không nhét response vào Zustand trừ khi cần transform bền vững và đã document |
| Giá trị field form + validate | **React Hook Form + Zod** | Một nguồn sự thật cho submit; không duplicate sang store |
| UI state toàn cục / list filter / bước wizard / selection không submit | **Zustand** | Store tại `client/stores/<name>Store.ts` |
| Hành vi lặp (điều hướng sau action, toast, đoạn xử lý dài) | **Custom hooks** (event / domain) | `client/hooks/use<Feature>Events.ts` hoặc `use<Feature>Actions.ts` — xem mục **Event hooks** |

### Global state (Zustand)

- **Khi dùng:** filter & sort màn list, sidebar selection, bước multi-step không map 1-1 form schema, flags UI (dialog mở/đóng) cần share giữa nhiều section — không thay thế RHF cho form chính.
- **Cấu trúc:** `create()` với state + action; nhóm theo vùng màn hình (`searchFilters`, `tableSelection`, …). Reset cascade trong action (ví dụ đổi `majorTypeId` → xóa `minorTypeId`, `projectId`).
- **Naming:** file `*Store.ts`, export hook `useXxxStore`; selector cụ thể để tránh re-render không cần (`useStore(s => s.foo)`).
- **Auth / session:** `client/stores/authStore.ts` — token, user; không trộn business domain list vào đây.
- **Ví dụ trong repo:** `mailTemplateSettingsStore`, `urlFormTemplateSettingsStore`, `staffSearchStore`, `listCreateStore`.

### Event hooks

- **Mục đích:** gom logic gọi từ UI (click, submit phụ) mà không phải là state: `navigate` sau save, `toast`, gọi mutation kèm điều kiện, analytics — giữ component/page **mỏng**, dễ test hook riêng.
- **Đặt file:** `client/hooks/use<Feature>Events.ts` hoặc cùng feature với API hook `use<Feature>Api.ts` nếu chỉ bọc mutation + feedback (`useMailTemplateFormPage` là ví dụ orchestrator form + mutation).
- **Pattern:** hook trả về object `{ onSave, onDelete, onRowClick, … }` hoặc tuple; bên trong dùng `useCallback` / `useNavigate` / `toast` / `useMutation`; không nhét JSX.
- **Phân biệt:** **API hook** = data fetching (React Query); **event hook** = điều phối hành động người dùng + side-effect; **Zustand** = state cần persist hoặc share giữa nhiều component không qua props.

### State Management (legacy bullets — vẫn áp dụng)

- Dùng **Zustand** cho state cấp màn / list phức tạp (không dùng `useState` rải rác cho cùng một concern).
- Gom state theo section: `formLoad`, `formSettings`, `formFields` (tuỳ màn).
- Nhúng cascade reset trong action của store (ví dụ `setMajorTypeId` tự xóa `minorTypeId` + `projectId`).
- Store pattern: `client/stores/<pageName>Store.ts`

### Components
- **Always use system components** from `components/ui/` (Button, Input, Label, Textarea, Select, RadioGroup, layout `header` / `app-sidebar`, etc.)
- **Never use raw HTML** (`<button>`, `<input>`, `<svg>`) — use system components + lucide-react icons
- **Button component** (`@/components/ui/button`) đã có sẵn `disabled:pointer-events-none`, `disabled:opacity-50`, `transition-colors` qua CVA variants. Khi tạo button-like components trong pages, dùng `<Button>` thay vì `<button>` — không cần duplicate `if (disabled) return` trong mouse handlers hay manual opacity/cursor. Nếu cần hover effects với dynamic colors, dùng CSS custom properties (`--var`) + scoped CSS rule thay vì `onMouseEnter`/`onMouseLeave` JS handlers.
- **New shared UI:** add under `components/ui/` with **kebab-case** filename; avoid PascalCase at `components/` root (legacy root components were moved into `ui/`).
- Create **reusable UI components** for common patterns:
  - `RichTextField` (`components/ui/rich-text-field.tsx`) — Label + ReactQuill
  - `ExpandablePanel` (`components/ui/expandable-panel.tsx`) — collapsible panel
- Break large pages into **section components** in a feature folder (e.g., `components/form-template/`)
- Section components read state from Zustand store directly (no prop drilling)

### Form Validation — react-hook-form + Zod

- **All form pages** use **`react-hook-form`** + **`zodResolver`** + **Zod schema** for validation. Do **not** use manual `useState` for form values or field errors.
- **Required UX sync:** fields required by spec/schema must also pass `required` to UI input components (e.g. `NotchInput required`) so users see the required marker consistently.
- Define a **Zod schema** per form. Use **`superRefine`** when validation order matters (required → range → format) and messages come from `getMessage()`.
- Use **`Controller`** to bridge `react-hook-form` with custom components like `NotchInput`. In `Controller.render`, call `clearErrors(fieldName)` inside `onChange` to clear errors on edit.
- **Server-side / throttle errors** (API failures, lockout) stay in a separate `useState<string | null>` (`serverError`), not in the Zod schema.
- Pattern: `useForm({ resolver: zodResolver(schema), defaultValues })` → `handleSubmit(onSubmit)` → `onSubmit` receives validated data.

### Form fields — max length & input patterns

- Define **numeric limits in one place** (e.g. `client/constants/loginForm.ts`) and reuse in the Zod schema, **`maxLength` on inputs** (e.g. `NotchInput`), and tests.
- **Shared input patterns** live in `client/constants/inputPatterns.ts`: `PATTERN_HANKAKU` (半角英数字・記号), `PATTERN_NUMERIC` (半角数字), `PATTERN_EMAIL`, `PATTERN_PHONE`.
- **`NotchInput`** has a default `inputFilter="hankaku"` that rejects invalid characters on every keystroke. Set `inputFilter="numeric"` / `"phone"` / `null` as needed.
- **ログインID** (spec example: TextBox / 半角英数字・記号 / 8–255 / 未入力): after trim, validate **length range** (`MSE00074` with `min`/`max`), then **allowed characters** (e.g. `LOGIN_ID_PATTERN` for printable half-width ASCII), using **`MSE00058`** when the format is wrong. **未入力** remains **`MSE00059`**.
- **Other fields:** use **`getMessage("MSE00076", { attribute, max })`** for over-max length (`:attributeは:max文字以下で指定してください。`).
- Order: **required (trim)** → **length range / format** → **max length** as applicable.
- **Unit tests:** `maxLength` on the DOM can block typing long strings — assert over-limit behavior with **`fireEvent.change(input, { target: { value: "x".repeat(MAX + 1) } })`** on a controlled field, then submit. Also test **exactly `MAX` characters** still calls the API / passes validation.

### API Hooks
- **Ưu tiên dùng `useCommonApi.ts`** cho shared master data trước khi tạo hook mới trong feature-specific files.
- `useCommonMasterData(params)` returns queries + pre-mapped `SelectOption[]` arrays
- Feature-specific CRUD hooks stay in `hooks/use<Feature>Api.ts`
- Follow react-query patterns: `useQuery` for reads, `useMutation` for writes

**Common hooks (`useCommonApi.ts`):**

| Hook | Params | Filter | Notes |
|------|--------|--------|-------|
| `useMajorTypes(typeFilter=1)` | `typeFilter` | `{type: typeFilter}` | 業務タイプ |
| `useMinorTypes(majorTypeId)` | `majorTypeId` | `{major_type_id}` | 小業務タイプ, enabled khi có majorTypeId |
| `useProjects(minorTypeId)` | `minorTypeId` | `{minor_type_id}` | 案件, **chỉ filter theo minorTypeId** |
| `useDealingContents()` | — | — | 応対内容 |
| `useRMethods()` | — | — | Review methods |
| `useRStatuses()` | — | sort `num:asc` | Review statuses |
| `useUsers()` | — | — | All users |
| `useMedias(enabled)` | `enabled` | — | Media master (optional, CaseDetail) |
| `useCorps(enabled)` | `enabled` | — | Corps + goods (optional, CaseDetail) |

`useCommonMasterData(params)` bundles: majorTypes, minorTypes, projects, dealingContents + optional medias/corps → returns cả raw queries lẫn pre-mapped `SelectOption[]` (`majorTypeOpts`, `minorTypeOpts`, `projectOpts`, …).

**Feature-specific override — MailTemplate `useProjects`:**
- `useMailTemplateApi.ts` có riêng `useProjects(majorTypeId, minorTypeId)` — filter **fallback**: ưu tiên `minor_type_id`, nếu chưa có thì dùng `major_type_id`. Lý do: MailTemplateForm cho phép chọn project ngay khi chỉ có categoryL (大分類) mà chưa cần categoryS (小分類).
- `useMailTemplateFormPage.ts` gọi `useProjects(store.categoryL, store.categoryS)` → cascade: chọn categoryL → load projects theo major; chọn thêm categoryS → re-filter theo minor.
- `useProjectDeadlines(projectId)` — lấy deadline (publish_date, interim_deadline, final_deadline) để tính URL expiry cho mail groups.

### Animations & Styles
- Shared admin page animations: `client/styles/form-animations.ts` (`FORM_ANIM_STYLES`)
- Inject via `<style>{FORM_ANIM_STYLES}</style>` — not duplicated per page
- Do **not** define per-page `ANIM_STYLES` constants when `FORM_ANIM_STYLES` already covers the page; extend `form-animations.ts` once if a new shared class/keyframe is truly needed.
- Neumorphic/glass design classes: `neu-card`, `glass-card`, `glass-item`, `hover-lift`, `glow-hover`

### Page Structure (admin form pages)
```
Page (thin orchestrator ~150 lines)
├── Zustand store (state + actions + cascade logic) — khi cần global/page UI state
├── use<Feature>FormPage / use<Feature>Events — điều phối form + mutation + navigate + toast
├── useCommonMasterData() for dropdowns
├── use<Feature>Api() for CRUD
├── Sections (read from store, render UI)
│   ├── LoadSection
│   ├── SettingsSection
│   ├── PurposeSection
│   └── FieldsSection → FieldItem → FieldDetail
├── ActionBar (buttons: preview, save, delete, copy)
└── PreviewDialog
```

## 11. Key Files

| Purpose | File |
|---------|------|
| Routing | `client/App.tsx` |
| API client | `client/lib/api.ts` |
| API paths | `client/constants/apiPaths.ts` |
| Route paths | `client/constants/routePaths.ts` |
| Input patterns | `client/constants/inputPatterns.ts` — `PATTERN_HANKAKU`, `PATTERN_NUMERIC`, `PATTERN_EMAIL`, `PATTERN_PHONE`, `INPUT_FILTER` |
| Login field limits | `client/constants/loginForm.ts` — `LOGIN_ID_PATTERN`, `LOGIN_ID_MIN_LENGTH` / `LOGIN_ID_MAX_LENGTH`, `PASSWORD_PATTERN`, `PASSWORD_MAX_LENGTH` |
| 応対履歴登録 (StaffResponseHistory) | `client/constants/responseHistoryForm.ts` — `responseRegSchema` + `RESPONSE_REG_*_MAX_LENGTH`; RHF + Zod; コード=`PATTERN_HANKAKU`、ユーザー=`PATTERN_ZENKAKU_JP` + `hankaku_jp`；**コメント**はフリーテキストのため `inputFilter={null}`、Zod は **最大文字数のみ** |
| Auth store | `client/stores/authStore.ts` |
| Zustand (list / filter / wizard UI) | `client/stores/*Store.ts` — xem **Global state (Zustand)** |
| Event / page orchestrator hooks | `client/hooks/use<Feature>FormPage.ts`, `use<Feature>Events.ts` — xem **Event hooks** |
| URL フォーム一覧（検索・ページング） | `client/stores/urlFormTemplateSettingsStore.ts` — pattern giống `formTemplateSettingsStore` |
| Global styles | `client/global.css` |
| Tailwind config | `tailwind.config.ts` |
| cn() utility | `client/lib/utils.ts` |
| Form types | `shared/form-template.ts` |
| App header / sidebar | `client/components/ui/header.tsx`, `client/components/ui/app-sidebar.tsx` |
| shadcn config | `components.json` (root) |
| Vitest setup | `client/test/setup.ts`, `vite.config.ts` (`test`) |
| Login unit tests | `client/pages/Login.test.tsx` |

## 12. Refactor note (components → ui)

- Layout and shared inputs that previously lived at `components/*.tsx` now live under **`components/ui/`** with **kebab-case** names.
- **`app-sidebar.tsx`** = CRM navigation; **`sidebar.tsx`** = shadcn SidebarProvider / layout primitives (do not merge).
- All pages and feature folders import from `@/components/ui/...`.

## 13. Unit testing (Vitest + React Testing Library)

**Stack:** `vitest` (runner), `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`. Config lives in **`vite.config.ts`** (`test` block); setup file **`client/test/setup.ts`** registers jest-dom matchers.

### File naming & placement

- Colocate tests next to the unit under test: **`client/pages/Login.test.tsx`** next to `Login.tsx`, or **`client/lib/foo.test.ts`** next to `foo.ts`.
- Only import paths under `client/` and `shared/`; avoid pulling Vite `server/` into unit tests unless explicitly testing the Express app.

### What to test

- **Pages:** user-visible behavior — form submit, navigation, error messages, loading/disabled states. Mock network (`@/lib/api`), auth (`@/stores/authStore`), router when needed, and side-effect modules (e.g. `@/lib/loginThrottle`).
- **Pure logic:** `client/lib/*.ts` — test without mocks when possible (fast, deterministic).

### Rules

1. **Prefer `userEvent` + role/placeholder queries** over brittle CSS selectors. Use `screen.getByRole`, `getByPlaceholderText`, etc.
2. **Mock boundaries, not implementation details** — e.g. `vi.mock("@/lib/api", () => ({ api: { post: vi.fn(), ... }, ApiError }))` so the component under test stays real.
3. **Isolate DOM between tests:** call **`cleanup()`** from `@testing-library/react` in `afterEach` (or rely on a shared test wrapper that unmounts) so multiple `render()` calls do not stack in the same `document`.
4. **Router:** wrap with **`MemoryRouter`** + minimal `<Routes>`; pass **`future`** flags (`v7_startTransition`, `v7_relativeSplatPath`) to avoid React Router v7 noise in stderr.
5. **Async:** use `waitFor` / `findBy*` for post-submit UI and navigation assertions.
6. **No real network** in unit tests — stub `fetch` only if testing code that calls it directly; for app code using `api.*`, mock `@/lib/api`.
7. **Keep tests fast:** avoid `setTimeout` sleeps; use fake timers only when testing time-dependent helpers (e.g. throttle) in dedicated `*.test.ts` files.
8. **Length / format:** import the same constants as the page (`loginForm.ts`); use **`fireEvent.change`** to bypass `maxLength` when testing submit-side validation; cover **min/max range** (`MSE00074`), **format** (`MSE00058` for login ID charset), **max only** (`MSE00076`), and **boundary** (e.g. 8 and 255 chars for ログインID).

### Example (Login)

See **`client/pages/Login.test.tsx`**: mocks `api.post`, `useAuth`, `loginThrottle`; asserts logout on mount, successful login + redirect, `ApiError` message, lockout path, required/trim validation, **max-length validation** (`MSE00076`), input-filter blocking (full-width chars), and boundary submit. Login uses **react-hook-form + zodResolver + Zod `superRefine`** for field validation, with `Controller` bridging to `NotchInput`.
